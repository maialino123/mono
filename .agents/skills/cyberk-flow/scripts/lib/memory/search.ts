import type { Database } from "bun:sqlite";
import { recordCoAccess } from "./co-access";
import type { DocType, EmbeddingProvider, SearchOptions, SearchResult } from "./types";
import { bufferToEmbedding, cosineSimilarity, embeddingToBuffer } from "./vector";

const RRF_K = 60;
const DECAY_RATE = 0.995;
const CONFIDENCE_FLOOR = 0.1;
const BOOST_FACTOR = 1.03;
const CONFIDENCE_CAP = 1.0;

export function computeDecayedConfidence(confidence: number, updatedAt: string): number {
  const now = Date.now();
  // Normalize SQLite datetime format "YYYY-MM-DD HH:MM:SS" to ISO 8601
  const isoString = updatedAt.includes("T") ? updatedAt : updatedAt.replace(" ", "T") + "Z";
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return confidence;
  const hours = Math.max(0, (now - then) / (1000 * 60 * 60));
  return Math.max(CONFIDENCE_FLOOR, confidence * DECAY_RATE ** hours);
}

export function boostConfidence(db: Database, docId: number): void {
  db.run(
    `UPDATE documents SET
       confidence = MIN(confidence * ?, ?),
       access_count = access_count + 1,
       last_accessed_at = datetime('now')
     WHERE id = ?`,
    [BOOST_FACTOR, CONFIDENCE_CAP, docId],
  );
}

interface ChunkRow {
  id: number;
  doc_id: number;
  heading: string | null;
  content: string;
  embedding: Buffer | null;
}

interface DocRow {
  path: string;
  doc_type: string;
}

function buildLabelCTE(labels: string[]): { cte: string; params: string[]; whereClause: string } {
  if (labels.length === 0) return { cte: "", params: [], whereClause: "" };
  const placeholders = labels.map(() => "?").join(", ");
  const cte = `WITH label_docs AS (
    SELECT doc_id FROM document_labels
    WHERE label IN (${placeholders})
    GROUP BY doc_id
    HAVING COUNT(DISTINCT label) = ${labels.length}
  ) `;
  return { cte, params: [...labels], whereClause: " AND d.id IN (SELECT doc_id FROM label_docs)" };
}

function lookupLabels(db: Database, docIds: number[]): Map<number, string[]> {
  const result = new Map<number, string[]>();
  if (docIds.length === 0) return result;
  const placeholders = docIds.map(() => "?").join(", ");
  const rows = db
    .prepare(`SELECT doc_id, label FROM document_labels WHERE doc_id IN (${placeholders}) ORDER BY label`)
    .all(...docIds) as { doc_id: number; label: string }[];
  for (const row of rows) {
    const existing = result.get(row.doc_id);
    if (existing) {
      existing.push(row.label);
    } else {
      result.set(row.doc_id, [row.label]);
    }
  }
  return result;
}

function lookupLabelsByPaths(db: Database, paths: string[]): Map<string, string[]> {
  const result = new Map<string, string[]>();
  if (paths.length === 0) return result;
  const placeholders = paths.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT d.path, dl.label FROM document_labels dl
       JOIN documents d ON d.id = dl.doc_id
       WHERE d.path IN (${placeholders}) ORDER BY dl.label`,
    )
    .all(...paths) as { path: string; label: string }[];
  for (const row of rows) {
    const existing = result.get(row.path);
    if (existing) {
      existing.push(row.label);
    } else {
      result.set(row.path, [row.label]);
    }
  }
  return result;
}

function keywordSearch(
  db: Database,
  query: string,
  limit: number,
  labels?: string[],
  docType?: DocType,
): (SearchResult & { chunkId: number })[] {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const ftsQuery = terms.map((t) => `"${t.replace(/"/g, '""')}"`).join(" OR ");

  try {
    const labelFilter = labels && labels.length > 0 ? buildLabelCTE(labels) : { cte: "", params: [], whereClause: "" };
    const docTypeClause = docType ? " AND d.doc_type = ?" : "";
    const params: (string | number)[] = [...labelFilter.params, ftsQuery];
    if (docType) params.push(docType);
    params.push(limit);

    const rows = db
      .prepare(
        `${labelFilter.cte}SELECT c.id AS chunk_id, c.heading, c.content, d.path, d.id AS doc_id, d.doc_type, rank
         FROM chunks_fts fts
         JOIN chunks c ON c.id = fts.rowid
         JOIN documents d ON d.id = c.doc_id
         WHERE chunks_fts MATCH ?${labelFilter.whereClause}${docTypeClause}
         ORDER BY rank
         LIMIT ?`,
      )
      .all(...params) as (ChunkRow & DocRow & { chunk_id: number; doc_id: number; rank: number })[];

    if (rows.length === 0) return [];

    const docIds = [...new Set(rows.map((r) => r.doc_id))];
    const labelsMap = lookupLabels(db, docIds);

    const minRank = Math.min(...rows.map((r) => r.rank));
    const maxRank = Math.max(...rows.map((r) => r.rank));
    const range = maxRank - minRank || 1;

    return rows.map((row) => ({
      chunkId: row.chunk_id,
      path: row.path,
      heading: row.heading,
      content: row.content,
      score: 1 - (row.rank - minRank) / range,
      matchType: "keyword" as const,
      labels: labelsMap.get(row.doc_id) ?? [],
      docType: (row.doc_type ?? "semantic") as DocType,
    }));
  } catch {
    return [];
  }
}

function vectorSearch(
  db: Database,
  vecAvailable: boolean,
  queryEmbedding: Float32Array,
  limit: number,
  labels?: string[],
  docType?: DocType,
): (SearchResult & { chunkId: number })[] {
  if (queryEmbedding.length === 0) return [];

  const labelFilter = labels && labels.length > 0 ? buildLabelCTE(labels) : { cte: "", params: [], whereClause: "" };

  if (vecAvailable) {
    try {
      const docTypeClause = docType ? " AND d.doc_type = ?" : "";
      const params: (Buffer | string | number)[] = [...labelFilter.params, embeddingToBuffer(queryEmbedding)];
      if (docType) params.push(docType);
      params.push(limit);

      const rows = db
        .prepare(
          `${labelFilter.cte}SELECT v.rowid AS chunk_id, v.distance, c.heading, c.content, d.path, d.id AS doc_id, d.doc_type
           FROM chunks_vec v
           JOIN chunks c ON c.id = v.rowid
           JOIN documents d ON d.id = c.doc_id
           WHERE v.embedding MATCH ?${labelFilter.whereClause}${docTypeClause}
           ORDER BY v.distance
           LIMIT ?`,
        )
        .all(...params) as (ChunkRow & DocRow & { chunk_id: number; doc_id: number; distance: number })[];

      const docIds = [...new Set(rows.map((r) => r.doc_id))];
      const labelsMap = lookupLabels(db, docIds);

      return rows.map((row) => ({
        chunkId: row.chunk_id,
        path: row.path,
        heading: row.heading,
        content: row.content,
        score: Math.max(0, 1 - row.distance),
        matchType: "vector" as const,
        labels: labelsMap.get(row.doc_id) ?? [],
        docType: (row.doc_type ?? "semantic") as DocType,
      }));
    } catch {
      // Fall through to JS fallback
    }
  }

  // JS brute-force fallback
  const docTypeClause = docType ? " AND d.doc_type = ?" : "";
  const fallbackParams: string[] = [...labelFilter.params];
  if (docType) fallbackParams.push(docType);

  const rows = db
    .prepare(
      `${labelFilter.cte}SELECT c.id AS chunk_id, c.heading, c.content, c.embedding, d.path, d.id AS doc_id, d.doc_type
       FROM chunks c
       JOIN documents d ON d.id = c.doc_id
       WHERE c.embedding IS NOT NULL${labelFilter.whereClause}${docTypeClause}`,
    )
    .all(...fallbackParams) as (ChunkRow & DocRow & { chunk_id: number; doc_id: number })[];

  if (rows.length === 0) return [];

  const scored = rows
    .map((row) => {
      const emb = bufferToEmbedding(row.embedding as Buffer);
      return { ...row, score: cosineSimilarity(queryEmbedding, emb) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const docIds = [...new Set(scored.map((r) => r.doc_id))];
  const labelsMap = lookupLabels(db, docIds);

  return scored.map((row) => ({
    chunkId: row.chunk_id,
    path: row.path,
    heading: row.heading,
    content: row.content,
    score: row.score,
    matchType: "vector" as const,
    labels: labelsMap.get(row.doc_id) ?? [],
    docType: (row.doc_type ?? "semantic") as DocType,
  }));
}

function hybridMerge(
  kwResults: (SearchResult & { chunkId: number })[],
  vecResults: (SearchResult & { chunkId: number })[],
  limit: number,
): SearchResult[] {
  const scoreMap = new Map<number, { result: SearchResult; score: number }>();

  const addScores = (results: (SearchResult & { chunkId: number })[]) => {
    for (let rank = 0; rank < results.length; rank++) {
      const r = results[rank];
      const rrfScore = 1 / (RRF_K + rank + 1);
      const existing = scoreMap.get(r.chunkId);
      if (existing) {
        existing.score += rrfScore;
        existing.result.matchType = "hybrid";
      } else {
        scoreMap.set(r.chunkId, {
          result: {
            path: r.path,
            heading: r.heading,
            content: r.content,
            score: 0,
            matchType: r.matchType,
            labels: r.labels,
            docType: r.docType,
          },
          score: rrfScore,
        });
      }
    }
  };

  addScores(kwResults);
  addScores(vecResults);

  const merged = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const maxScore = merged[0]?.score ?? 1;

  return merged.map(({ result, score }) => ({
    ...result,
    score: maxScore > 0 ? score / maxScore : 0,
  }));
}

function likeFallback(
  db: Database,
  query: string,
  limit: number,
  labels?: string[],
  docType?: DocType,
): SearchResult[] {
  const pattern = `%${query}%`;
  const labelFilter = labels && labels.length > 0 ? buildLabelCTE(labels) : { cte: "", params: [], whereClause: "" };
  const docTypeClause = docType ? " AND d.doc_type = ?" : "";
  const params: (string | number)[] = [...labelFilter.params, pattern, pattern];
  if (docType) params.push(docType);
  params.push(limit);

  const rows = db
    .prepare(
      `${labelFilter.cte}SELECT c.heading, c.content, d.path, d.doc_type
       FROM chunks c
       JOIN documents d ON d.id = c.doc_id
       WHERE (c.content LIKE ? OR c.heading LIKE ?)${labelFilter.whereClause}${docTypeClause}
       LIMIT ?`,
    )
    .all(...params) as (Pick<ChunkRow, "heading" | "content"> & DocRow)[];

  const paths = [...new Set(rows.map((r) => r.path))];
  const labelsMap = lookupLabelsByPaths(db, paths);

  return rows.map((row, i) => ({
    path: row.path,
    heading: row.heading,
    content: row.content,
    score: 1 / (i + 1),
    matchType: "fallback" as const,
    labels: labelsMap.get(row.path) ?? [],
    docType: (row.doc_type ?? "semantic") as DocType,
  }));
}

function stripChunkId(results: (SearchResult & { chunkId: number })[]): SearchResult[] {
  return results.map(({ chunkId: _, ...rest }) => rest);
}

function dedupeByPath(results: SearchResult[], maxChunksPerDoc: number): SearchResult[] {
  const counts = new Map<string, number>();
  const out: SearchResult[] = [];
  for (const r of results) {
    const n = counts.get(r.path) ?? 0;
    if (n < maxChunksPerDoc) {
      out.push(r);
      counts.set(r.path, n + 1);
    }
  }
  return out;
}

function blendScores(db: Database, results: SearchResult[]): SearchResult[] {
  if (results.length === 0) return results;

  // Fetch document metadata for all result paths
  const paths = [...new Set(results.map((r) => r.path))];
  const docMeta = new Map<string, { confidence: number; updatedAt: string; pagerank: number }>();
  for (const path of paths) {
    const row = db
      .prepare(
        "SELECT confidence, COALESCE(last_accessed_at, updated_at) AS updated_at, pagerank FROM documents WHERE path = ?",
      )
      .get(path) as { confidence: number; updated_at: string; pagerank: number } | null;
    if (row) {
      docMeta.set(path, { confidence: row.confidence, updatedAt: row.updated_at, pagerank: row.pagerank });
    }
  }

  // Get max PageRank for normalization (D2b: if 0, skip PageRank blending)
  const maxPageRank = Math.max(0, ...Array.from(docMeta.values()).map((m) => m.pagerank));

  return results.map((r) => {
    const meta = docMeta.get(r.path);
    if (!meta) return r;

    const decayedConf = computeDecayedConfidence(meta.confidence, meta.updatedAt);
    const confidenceFactor = 0.7 + 0.3 * decayedConf;

    let pagerankFactor = 1.0;
    if (maxPageRank > 0) {
      const normPageRank = meta.pagerank / maxPageRank;
      pagerankFactor = 0.8 + 0.2 * normPageRank;
    }

    return { ...r, score: r.score * confidenceFactor * pagerankFactor };
  });
}

const CO_ACCESS_TOP_N = 5;

function trackAccess(db: Database, results: SearchResult[]): void {
  if (results.length === 0) return;

  // Get unique doc IDs from results
  const paths = [...new Set(results.map((r) => r.path))];
  const docIds: number[] = [];
  const boostedIds = new Set<number>();

  for (const path of paths) {
    const row = db.prepare("SELECT id FROM documents WHERE path = ?").get(path) as { id: number } | null;
    if (row) {
      docIds.push(row.id);
      if (!boostedIds.has(row.id)) {
        boostConfidence(db, row.id);
        boostedIds.add(row.id);
      }
    }
  }

  // Record co-access for top N docs (by result order = relevance rank)
  const topDocIds = docIds.slice(0, CO_ACCESS_TOP_N);
  if (topDocIds.length >= 2) {
    recordCoAccess(db, topDocIds);
  }
}

export async function searchMemory(
  db: Database,
  vecAvailable: boolean,
  provider: EmbeddingProvider,
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const mode = options.mode ?? "hybrid";
  const limit = options.limit ?? 10;
  const labels = options.labels
    ? [...new Set(options.labels.map((l) => l.trim().toLowerCase()).filter(Boolean))]
    : undefined;
  const docType = options.docType;
  const dedupe = options.dedupe ?? true;
  const maxChunksPerDoc = options.maxChunksPerDoc ?? 1;

  if (!query.trim()) return [];

  // Over-fetch candidates when dedup is on to reduce chance of shrinking below limit
  const candidateLimit = dedupe ? Math.min(100, limit * maxChunksPerDoc * 3) : limit;

  let rawResults: SearchResult[];

  if (mode === "keyword") {
    const kwResults = keywordSearch(db, query, candidateLimit, labels, docType);
    if (kwResults.length > 0) {
      rawResults = stripChunkId(kwResults);
    } else {
      rawResults = likeFallback(db, query, candidateLimit, labels, docType);
    }
  } else if (mode === "vector") {
    let found = false;
    if (provider.dimensions > 0) {
      try {
        const [queryEmb] = await provider.embed([query]);
        if (queryEmb && queryEmb.length > 0) {
          const vecResults = vectorSearch(db, vecAvailable, queryEmb, candidateLimit, labels, docType);
          if (vecResults.length > 0) {
            rawResults = stripChunkId(vecResults);
            found = true;
          }
        }
      } catch {
        // Fall through to keyword
      }
    }
    if (!found) {
      const kwResults = keywordSearch(db, query, candidateLimit, labels, docType);
      if (kwResults.length > 0) {
        rawResults = stripChunkId(kwResults);
      } else {
        rawResults = likeFallback(db, query, candidateLimit, labels, docType);
      }
    }
  } else {
    // Hybrid mode
    const kwResults = keywordSearch(db, query, candidateLimit, labels, docType);

    let vecResults: (SearchResult & { chunkId: number })[] = [];
    if (provider.dimensions > 0) {
      try {
        const [queryEmb] = await provider.embed([query]);
        if (queryEmb && queryEmb.length > 0) {
          vecResults = vectorSearch(db, vecAvailable, queryEmb, candidateLimit, labels, docType);
        }
      } catch {
        // Continue with keyword-only
      }
    }

    if (kwResults.length > 0 && vecResults.length > 0) {
      rawResults = hybridMerge(kwResults, vecResults, candidateLimit);
    } else if (kwResults.length > 0) {
      rawResults = stripChunkId(kwResults);
    } else if (vecResults.length > 0) {
      rawResults = stripChunkId(vecResults);
    } else {
      rawResults = likeFallback(db, query, candidateLimit, labels, docType);
    }
  }

  // Apply confidence + PageRank blending
  const blended = blendScores(db, rawResults!);

  // Sort by blended score so ranking reflects confidence + PageRank
  blended.sort((a, b) => b.score - a.score);

  // Deduplicate by document path, then slice to requested limit
  const deduped = dedupe ? dedupeByPath(blended, maxChunksPerDoc) : blended;
  const final = deduped.slice(0, limit);

  // Track access + co-access
  trackAccess(db, final);

  return final;
}

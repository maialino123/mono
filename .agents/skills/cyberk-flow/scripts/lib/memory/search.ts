import type { Database } from "bun:sqlite";
import type { EmbeddingProvider, SearchOptions, SearchResult } from "./types";
import { bufferToEmbedding, cosineSimilarity, embeddingToBuffer } from "./vector";

const RRF_K = 60;

interface ChunkRow {
  id: number;
  doc_id: number;
  heading: string | null;
  content: string;
  embedding: Buffer | null;
}

interface DocRow {
  path: string;
}

function keywordSearch(db: Database, query: string, limit: number): (SearchResult & { chunkId: number })[] {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const ftsQuery = terms.map((t) => `"${t.replace(/"/g, '""')}"`).join(" OR ");

  try {
    const rows = db
      .prepare(
        `SELECT c.id AS chunk_id, c.heading, c.content, d.path, rank
         FROM chunks_fts fts
         JOIN chunks c ON c.id = fts.rowid
         JOIN documents d ON d.id = c.doc_id
         WHERE chunks_fts MATCH ?
         ORDER BY rank
         LIMIT ?`,
      )
      .all(ftsQuery, limit) as (ChunkRow & DocRow & { chunk_id: number; rank: number })[];

    if (rows.length === 0) return [];

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
): (SearchResult & { chunkId: number })[] {
  if (queryEmbedding.length === 0) return [];

  if (vecAvailable) {
    try {
      const rows = db
        .prepare(
          `SELECT v.rowid AS chunk_id, v.distance, c.heading, c.content, d.path
           FROM chunks_vec v
           JOIN chunks c ON c.id = v.rowid
           JOIN documents d ON d.id = c.doc_id
           WHERE v.embedding MATCH ?
           ORDER BY v.distance
           LIMIT ?`,
        )
        .all(embeddingToBuffer(queryEmbedding), limit) as (ChunkRow &
        DocRow & { chunk_id: number; distance: number })[];

      return rows.map((row) => ({
        chunkId: row.chunk_id,
        path: row.path,
        heading: row.heading,
        content: row.content,
        score: Math.max(0, 1 - row.distance),
        matchType: "vector" as const,
      }));
    } catch {
      // Fall through to JS fallback
    }
  }

  // JS brute-force fallback
  const rows = db
    .prepare(
      `SELECT c.id AS chunk_id, c.heading, c.content, c.embedding, d.path
       FROM chunks c
       JOIN documents d ON d.id = c.doc_id
       WHERE c.embedding IS NOT NULL`,
    )
    .all() as (ChunkRow & DocRow & { chunk_id: number })[];

  if (rows.length === 0) return [];

  const scored = rows
    .map((row) => {
      const emb = bufferToEmbedding(row.embedding as Buffer);
      return { ...row, score: cosineSimilarity(queryEmbedding, emb) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((row) => ({
    chunkId: row.chunk_id,
    path: row.path,
    heading: row.heading,
    content: row.content,
    score: row.score,
    matchType: "vector" as const,
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
          result: { path: r.path, heading: r.heading, content: r.content, score: 0, matchType: r.matchType },
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

function likeFallback(db: Database, query: string, limit: number): SearchResult[] {
  const pattern = `%${query}%`;
  const rows = db
    .prepare(
      `SELECT c.heading, c.content, d.path
       FROM chunks c
       JOIN documents d ON d.id = c.doc_id
       WHERE c.content LIKE ? OR c.heading LIKE ?
       LIMIT ?`,
    )
    .all(pattern, pattern, limit) as (Pick<ChunkRow, "heading" | "content"> & DocRow)[];

  return rows.map((row, i) => ({
    path: row.path,
    heading: row.heading,
    content: row.content,
    score: 1 / (i + 1),
    matchType: "fallback" as const,
  }));
}

function stripChunkId(results: (SearchResult & { chunkId: number })[]): SearchResult[] {
  return results.map(({ chunkId: _, ...rest }) => rest);
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

  if (!query.trim()) return [];

  if (mode === "keyword") {
    const kwResults = keywordSearch(db, query, limit);
    if (kwResults.length > 0) return stripChunkId(kwResults);
    return likeFallback(db, query, limit);
  }

  if (mode === "vector") {
    // Embed query for vector search
    if (provider.dimensions > 0) {
      try {
        const [queryEmb] = await provider.embed([query]);
        if (queryEmb && queryEmb.length > 0) {
          const vecResults = vectorSearch(db, vecAvailable, queryEmb, limit);
          if (vecResults.length > 0) return stripChunkId(vecResults);
        }
      } catch {
        // Fall through to keyword
      }
    }
    // Fallback to keyword if no embeddings
    const kwResults = keywordSearch(db, query, limit);
    if (kwResults.length > 0) return stripChunkId(kwResults);
    return likeFallback(db, query, limit);
  }

  // Hybrid mode
  const kwResults = keywordSearch(db, query, limit);

  let vecResults: (SearchResult & { chunkId: number })[] = [];
  if (provider.dimensions > 0) {
    try {
      const [queryEmb] = await provider.embed([query]);
      if (queryEmb && queryEmb.length > 0) {
        vecResults = vectorSearch(db, vecAvailable, queryEmb, limit);
      }
    } catch {
      // Continue with keyword-only
    }
  }

  if (kwResults.length > 0 && vecResults.length > 0) {
    return hybridMerge(kwResults, vecResults, limit);
  }

  if (kwResults.length > 0) return stripChunkId(kwResults);
  if (vecResults.length > 0) return stripChunkId(vecResults);
  return likeFallback(db, query, limit);
}

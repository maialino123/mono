import type { Database } from "bun:sqlite";
import type { ConsolidationResult } from "./types";
import { computeDecayedConfidence } from "./search";
import { removeDocument } from "./indexer";
import { bufferToEmbedding, cosineSimilarity } from "./vector";

const SIMILARITY_THRESHOLD = 0.95;
const DECAY_THRESHOLD = 0.15;
const STALE_DAYS = 30;

interface ChunkRow {
  id: number;
  doc_id: number;
  embedding: Buffer;
  updated_at: string;
}

export function deduplicateChunks(db: Database, vecAvailable: boolean): { removed: number } {
  const rows = db
    .prepare(
      `SELECT c.id, c.doc_id, c.embedding, d.updated_at
       FROM chunks c
       JOIN documents d ON d.id = c.doc_id
       WHERE c.embedding IS NOT NULL`,
    )
    .all() as ChunkRow[];

  const toDelete = new Set<number>();
  // Pre-parse all embeddings to avoid O(N²) buffer conversions
  const embeddings = rows.map((r) => bufferToEmbedding(r.embedding));

  for (let i = 0; i < rows.length; i++) {
    if (toDelete.has(rows[i].id)) continue;
    const embA = embeddings[i];

    for (let j = i + 1; j < rows.length; j++) {
      if (toDelete.has(rows[j].id)) continue;
      const embB = embeddings[j];
      const sim = cosineSimilarity(embA, embB);

      if (sim >= SIMILARITY_THRESHOLD) {
        const aTime = new Date(rows[i].updated_at.replace(" ", "T") + "Z").getTime();
        const bTime = new Date(rows[j].updated_at.replace(" ", "T") + "Z").getTime();
        // Keep chunk from newer document, delete older
        if (aTime >= bTime) {
          toDelete.add(rows[j].id);
        } else {
          toDelete.add(rows[i].id);
        }
      }
    }
  }

  const affectedDocIds = new Set<number>();
  for (const chunkId of toDelete) {
    const row = rows.find((r) => r.id === chunkId);
    if (row) affectedDocIds.add(row.doc_id);
    if (vecAvailable) {
      db.run("DELETE FROM chunks_vec WHERE rowid = ?", [chunkId]);
    }
    db.run("DELETE FROM chunks WHERE id = ?", [chunkId]);
  }

  // Update chunk_count for affected documents
  for (const docId of affectedDocIds) {
    db.run("UPDATE documents SET chunk_count = (SELECT COUNT(*) FROM chunks WHERE doc_id = ?) WHERE id = ?", [docId, docId]);
  }

  return { removed: toDelete.size };
}

interface DocRow {
  id: number;
  confidence: number;
  access_count: number;
  updated_at: string;
}

export function pruneStaleDocuments(db: Database, vecAvailable: boolean): { pruned: number } {
  const docs = db
    .prepare("SELECT id, confidence, access_count, updated_at FROM documents")
    .all() as DocRow[];

  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  let pruned = 0;

  for (const doc of docs) {
    if (doc.access_count !== 0) continue;

    const docTime = new Date(doc.updated_at.replace(" ", "T") + "Z").getTime();
    if (docTime >= cutoff) continue;

    const decayed = computeDecayedConfidence(doc.confidence, doc.updated_at);
    if (decayed > DECAY_THRESHOLD) continue;

    removeDocument(db, vecAvailable, doc.id);
    pruned++;
  }

  return { pruned };
}

export async function consolidate(db: Database, vecAvailable: boolean): Promise<ConsolidationResult> {
  const { removed } = deduplicateChunks(db, vecAvailable);
  const { pruned } = pruneStaleDocuments(db, vecAvailable);
  return { deduplicatedChunks: removed, prunedDocuments: pruned };
}

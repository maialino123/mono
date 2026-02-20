import type { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { chunkMarkdown } from "./chunker";
import type { Chunk, EmbeddingProvider, IndexSummary } from "./types";
import { embeddingToBuffer } from "./vector";

export interface IndexContext {
  db: Database;
  vecAvailable: boolean;
  provider: EmbeddingProvider;
  projectRoot: string;
}

const INDEX_DIRS = ["cyberk-flow/specs", "cyberk-flow/changes/archive", "docs"];

function contentHash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

function discoverFiles(projectRoot: string): string[] {
  const files: string[] = [];
  for (const dir of INDEX_DIRS) {
    const absDir = resolve(projectRoot, dir);
    if (!existsSync(absDir)) continue;
    collectMdFiles(absDir, files);
  }
  return files.map((f) => normalizePath(relative(projectRoot, f)));
}

function collectMdFiles(dir: string, result: string[]): void {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      collectMdFiles(full, result);
    } else if (entry.name.endsWith(".md")) {
      result.push(full);
    }
  }
}

async function generateEmbeddings(provider: EmbeddingProvider, texts: string[]): Promise<(Buffer | null)[]> {
  if (provider.dimensions === 0 || texts.length === 0) {
    return texts.map(() => null);
  }
  try {
    const embeddings = await provider.embed(texts);
    return embeddings.map((e) => embeddingToBuffer(e));
  } catch {
    return texts.map(() => null);
  }
}

function writeNewDocument(
  db: Database,
  vecAvailable: boolean,
  relPath: string,
  hash: string,
  chunks: Chunk[],
  embeddings: (Buffer | null)[],
): void {
  db.run("INSERT INTO documents (path, content_hash, chunk_count) VALUES (?, ?, ?)", [relPath, hash, chunks.length]);

  const docRow = db.prepare("SELECT id FROM documents WHERE path = ?").get(relPath) as { id: number };
  const docId = docRow.id;

  const insertChunk = db.prepare(
    "INSERT INTO chunks (doc_id, chunk_index, heading, content, embedding) VALUES (?, ?, ?, ?, ?)",
  );

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const emb = embeddings[i] ?? null;
    insertChunk.run(docId, chunk.index, chunk.heading, chunk.content, emb);

    if (emb && vecAvailable) {
      const chunkRow = db
        .prepare("SELECT id FROM chunks WHERE doc_id = ? AND chunk_index = ?")
        .get(docId, chunk.index) as { id: number };
      db.run("INSERT INTO chunks_vec(rowid, embedding) VALUES (?, ?)", [chunkRow.id, emb]);
    }
  }
}

function writeUpdatedDocument(
  db: Database,
  vecAvailable: boolean,
  docId: number,
  hash: string,
  chunks: Chunk[],
  embeddings: (Buffer | null)[],
): void {
  if (vecAvailable) {
    const chunkIds = db.prepare("SELECT id FROM chunks WHERE doc_id = ?").all(docId) as { id: number }[];
    for (const { id } of chunkIds) {
      db.run("DELETE FROM chunks_vec WHERE rowid = ?", [id]);
    }
  }

  db.run("DELETE FROM chunks WHERE doc_id = ?", [docId]);
  db.run("UPDATE documents SET content_hash = ?, chunk_count = ?, updated_at = datetime('now') WHERE id = ?", [
    hash,
    chunks.length,
    docId,
  ]);

  const insertChunk = db.prepare(
    "INSERT INTO chunks (doc_id, chunk_index, heading, content, embedding) VALUES (?, ?, ?, ?, ?)",
  );

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const emb = embeddings[i] ?? null;
    insertChunk.run(docId, chunk.index, chunk.heading, chunk.content, emb);

    if (emb && vecAvailable) {
      const chunkRow = db
        .prepare("SELECT id FROM chunks WHERE doc_id = ? AND chunk_index = ?")
        .get(docId, chunk.index) as { id: number };
      db.run("INSERT INTO chunks_vec(rowid, embedding) VALUES (?, ?)", [chunkRow.id, emb]);
    }
  }
}

function removeDocument(db: Database, vecAvailable: boolean, docId: number): void {
  if (vecAvailable) {
    const chunkIds = db.prepare("SELECT id FROM chunks WHERE doc_id = ?").all(docId) as { id: number }[];
    for (const { id } of chunkIds) {
      db.run("DELETE FROM chunks_vec WHERE rowid = ?", [id]);
    }
  }

  db.run("DELETE FROM chunks WHERE doc_id = ?", [docId]);
  db.run("DELETE FROM documents WHERE id = ?", [docId]);
}

export async function indexDocuments(ctx: IndexContext): Promise<IndexSummary> {
  const summary: IndexSummary = { added: 0, updated: 0, removed: 0, unchanged: 0 };

  const discoveredPaths = discoverFiles(ctx.projectRoot);
  const discoveredSet = new Set(discoveredPaths);

  const existingDocs = ctx.db.prepare("SELECT id, path, content_hash FROM documents").all() as {
    id: number;
    path: string;
    content_hash: string;
  }[];

  const existingMap = new Map<string, { id: number; contentHash: string }>();
  for (const doc of existingDocs) {
    existingMap.set(doc.path, { id: doc.id, contentHash: doc.content_hash });
  }

  // Remove stale documents
  for (const doc of existingDocs) {
    if (!discoveredSet.has(doc.path)) {
      const txn = ctx.db.transaction(() => {
        removeDocument(ctx.db, ctx.vecAvailable, doc.id);
      });
      txn();
      summary.removed++;
    }
  }

  // Index new/changed documents
  for (const relPath of discoveredPaths) {
    const absPath = resolve(ctx.projectRoot, relPath);
    const content = readFileSync(absPath, "utf-8");
    const hash = contentHash(content);

    const existing = existingMap.get(relPath);

    if (!existing) {
      const chunks = chunkMarkdown(content);
      const embeddings = await generateEmbeddings(
        ctx.provider,
        chunks.map((c) => c.content),
      );
      const txn = ctx.db.transaction(() => {
        writeNewDocument(ctx.db, ctx.vecAvailable, relPath, hash, chunks, embeddings);
      });
      txn();
      summary.added++;
    } else if (existing.contentHash !== hash) {
      const chunks = chunkMarkdown(content);
      const embeddings = await generateEmbeddings(
        ctx.provider,
        chunks.map((c) => c.content),
      );
      const txn = ctx.db.transaction(() => {
        writeUpdatedDocument(ctx.db, ctx.vecAvailable, existing.id, hash, chunks, embeddings);
      });
      txn();
      summary.updated++;
    } else {
      summary.unchanged++;
    }
  }

  return summary;
}

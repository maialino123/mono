import type { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { chunkMarkdown } from "./chunker";
import { buildAdjacencyList, computePageRank, updatePageRanks } from "./graph";
import type { Chunk, DocType, EmbeddingProvider, IndexSummary } from "./types";
import { embeddingToBuffer } from "./vector";

export interface IndexContext {
  db: Database;
  vecAvailable: boolean;
  provider: EmbeddingProvider;
  projectRoot: string;
}

const INDEX_DIRS = ["cyberk-flow/specs", "cyberk-flow/changes/archive", "cyberk-flow/knowledge", "docs"];

const ARCHIVE_PREFIX = "cyberk-flow/changes/archive/";

export function pathToDocType(relPath: string): DocType {
  const basename = relPath.split("/").pop() ?? "";
  if (basename === "workflow.md") return "procedural";
  if (basename === "tasks.md") return "procedural";
  if (relPath.match(/^cyberk-flow\/changes\/archive\/[^/]+\/proposal\.md$/)) return "procedural";
  if (relPath.startsWith("docs/templates/")) return "semantic";
  if (relPath.startsWith("cyberk-flow/specs/")) return "semantic";
  if (relPath.startsWith("cyberk-flow/knowledge/")) return "semantic";
  if (relPath.startsWith("docs/")) return "semantic";
  return "semantic";
}

export interface Frontmatter {
  labels?: string[];
  source?: string;
  expires?: string;
  updated?: string;
}

export function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const block = match[1];
  const fm: Frontmatter = {};
  for (const line of block.split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    const value = rawValue.trim();
    if (key === "labels") {
      const arrMatch = value.match(/^\[(.+)\]$/);
      if (arrMatch) {
        fm.labels = arrMatch[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }
    } else if (key === "source") {
      fm.source = value;
    } else if (key === "expires") {
      fm.expires = value;
    } else if (key === "updated") {
      fm.updated = value;
    }
  }
  return fm;
}

export function isExpired(expires: string | undefined): boolean {
  if (!expires) return false;
  const expiryDate = new Date(expires);
  if (Number.isNaN(expiryDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiryDate < today;
}

export function pathToLabels(relPath: string, frontmatter?: Frontmatter): string[] {
  const labels: string[] = [];

  if (relPath.startsWith("cyberk-flow/specs/")) {
    labels.push("spec");
    const domain = relPath.split("/")[2];
    if (domain) labels.push(domain);
  } else if (relPath.startsWith(ARCHIVE_PREFIX)) {
    const rest = relPath.slice(ARCHIVE_PREFIX.length);
    const slashIdx = rest.indexOf("/");
    const changeName = slashIdx >= 0 ? rest.slice(0, slashIdx) : rest;
    if (slashIdx >= 0) {
      const inner = rest.slice(slashIdx);
      if (inner.startsWith("/specs/")) labels.push("delta-spec");
      else if (inner === "/discovery.md") labels.push("discovery");
      else if (inner === "/proposal.md") labels.push("proposal");
      else if (inner === "/tasks.md") labels.push("tasks");
      else if (inner === "/workflow.md") labels.push("workflow");
      else if (inner === "/design.md") labels.push("design");
      else labels.push("archive");
    } else {
      labels.push("archive");
    }
    labels.push(changeName);
  } else if (relPath.startsWith("cyberk-flow/knowledge/")) {
    labels.push("knowledge");
    const category = relPath.split("/")[2];
    if (category) labels.push(category);
  } else if (relPath.startsWith("docs/")) {
    labels.push("doc");
  }

  if (frontmatter?.labels) {
    for (const l of frontmatter.labels) {
      const normalized = l.trim().toLowerCase().replace(/\s+/g, "-");
      if (normalized && !labels.includes(normalized)) labels.push(normalized);
    }
  }

  return labels;
}

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

function writeLabels(db: Database, docId: number, labels: string[]): void {
  db.run("DELETE FROM document_labels WHERE doc_id = ?", [docId]);
  const insertLabel = db.prepare("INSERT INTO document_labels (doc_id, label) VALUES (?, ?)");
  for (const label of labels) {
    insertLabel.run(docId, label);
  }
}

function writeNewDocument(
  db: Database,
  vecAvailable: boolean,
  relPath: string,
  hash: string,
  labels: string[],
  docType: DocType,
  chunks: Chunk[],
  embeddings: (Buffer | null)[],
): void {
  db.run("INSERT INTO documents (path, content_hash, chunk_count, doc_type) VALUES (?, ?, ?, ?)", [
    relPath,
    hash,
    chunks.length,
    docType,
  ]);

  const docRow = db.prepare("SELECT id FROM documents WHERE path = ?").get(relPath) as { id: number };
  const docId = docRow.id;

  writeLabels(db, docId, labels);

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
  labels: string[],
  docType: DocType,
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
  db.run(
    "UPDATE documents SET content_hash = ?, chunk_count = ?, doc_type = ?, updated_at = datetime('now') WHERE id = ?",
    [hash, chunks.length, docType, docId],
  );

  writeLabels(db, docId, labels);

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

export function removeDocument(db: Database, vecAvailable: boolean, docId: number): void {
  if (vecAvailable) {
    const chunkIds = db.prepare("SELECT id FROM chunks WHERE doc_id = ?").all(docId) as { id: number }[];
    for (const { id } of chunkIds) {
      db.run("DELETE FROM chunks_vec WHERE rowid = ?", [id]);
    }
  }

  db.run("DELETE FROM chunks WHERE doc_id = ?", [docId]);
  db.run("DELETE FROM documents WHERE id = ?", [docId]);
}

function getExistingLabels(db: Database, docId: number): string[] {
  const rows = db.prepare("SELECT label FROM document_labels WHERE doc_id = ? ORDER BY label").all(docId) as {
    label: string;
  }[];
  return rows.map((r) => r.label);
}

function labelsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export async function indexDocuments(ctx: IndexContext): Promise<IndexSummary> {
  const summary: IndexSummary = { added: 0, updated: 0, removed: 0, unchanged: 0 };

  const discoveredPaths = discoverFiles(ctx.projectRoot);
  const discoveredSet = new Set(discoveredPaths);

  const existingDocs = ctx.db.prepare("SELECT id, path, content_hash, doc_type FROM documents").all() as {
    id: number;
    path: string;
    content_hash: string;
    doc_type: string;
  }[];

  const existingMap = new Map<string, { id: number; contentHash: string; docType: string }>();
  for (const doc of existingDocs) {
    existingMap.set(doc.path, { id: doc.id, contentHash: doc.content_hash, docType: doc.doc_type });
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

    // Parse frontmatter for knowledge files (and any file with frontmatter)
    const fm = parseFrontmatter(content);

    // Skip expired files
    if (isExpired(fm.expires)) {
      const existing = existingMap.get(relPath);
      if (existing) {
        // Remove previously-indexed expired doc
        const txn = ctx.db.transaction(() => {
          removeDocument(ctx.db, ctx.vecAvailable, existing.id);
        });
        txn();
        summary.removed++;
      }
      continue;
    }

    const hash = contentHash(content);
    const existing = existingMap.get(relPath);

    const labels = pathToLabels(relPath, fm);
    const docType = pathToDocType(relPath);

    if (!existing) {
      const chunks = chunkMarkdown(content);
      const embeddings = await generateEmbeddings(
        ctx.provider,
        chunks.map((c) => c.content),
      );
      const txn = ctx.db.transaction(() => {
        writeNewDocument(ctx.db, ctx.vecAvailable, relPath, hash, labels, docType, chunks, embeddings);
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
        writeUpdatedDocument(ctx.db, ctx.vecAvailable, existing.id, hash, labels, docType, chunks, embeddings);
      });
      txn();
      summary.updated++;
    } else {
      // Unchanged content — sync labels and doc_type if needed
      const existingLabels = getExistingLabels(ctx.db, existing.id);
      if (!labelsEqual(existingLabels, labels) || existing.docType !== docType) {
        const txn = ctx.db.transaction(() => {
          ctx.db.run("UPDATE documents SET doc_type = ? WHERE id = ?", [docType, existing.id]);
          writeLabels(ctx.db, existing.id, labels);
        });
        txn();
      }
      summary.unchanged++;
    }
  }

  // Compute and store PageRank scores
  const adjacency = buildAdjacencyList(ctx.db);
  const ranks = computePageRank(adjacency);
  if (ranks.size > 0) {
    updatePageRanks(ctx.db, ranks);
  }

  return summary;
}

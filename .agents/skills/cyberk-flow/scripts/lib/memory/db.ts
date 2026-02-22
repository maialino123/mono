import { Database } from "bun:sqlite";
import { existsSync, unlinkSync } from "node:fs";

const CURRENT_SCHEMA_VERSION = 4;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    content_hash TEXT NOT NULL,
    chunk_count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    confidence REAL NOT NULL DEFAULT 0.8,
    access_count INTEGER NOT NULL DEFAULT 0,
    last_accessed_at TEXT,
    pagerank REAL NOT NULL DEFAULT 0.0,
    doc_type TEXT NOT NULL DEFAULT 'semantic'
  )`,
  `CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    heading TEXT,
    content TEXT NOT NULL,
    embedding BLOB,
    UNIQUE(doc_id, chunk_index)
  )`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
    heading, content,
    content=chunks, content_rowid=id,
    tokenize='unicode61',
    prefix='2,3'
  )`,
  `CREATE TRIGGER IF NOT EXISTS chunks_ai AFTER INSERT ON chunks BEGIN
    INSERT INTO chunks_fts(rowid, heading, content) VALUES (new.id, new.heading, new.content);
  END`,
  `CREATE TRIGGER IF NOT EXISTS chunks_ad AFTER DELETE ON chunks BEGIN
    INSERT INTO chunks_fts(chunks_fts, rowid, heading, content) VALUES ('delete', old.id, old.heading, old.content);
  END`,
  `CREATE TRIGGER IF NOT EXISTS chunks_au AFTER UPDATE ON chunks BEGIN
    INSERT INTO chunks_fts(chunks_fts, rowid, heading, content) VALUES ('delete', old.id, old.heading, old.content);
    INSERT INTO chunks_fts(rowid, heading, content) VALUES (new.id, new.heading, new.content);
  END`,
  `CREATE TABLE IF NOT EXISTS embedding_cache (
    model_id TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    embedding BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (model_id, content_hash)
  )`,
  `CREATE TABLE IF NOT EXISTS co_access (
    doc_id_a INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    doc_id_b INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    co_count INTEGER NOT NULL DEFAULT 1,
    last_co_access TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (doc_id_a, doc_id_b),
    CHECK (doc_id_a < doc_id_b)
  )`,
  `CREATE TABLE IF NOT EXISTS document_labels (
    doc_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    PRIMARY KEY (doc_id, label)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_document_labels_label_doc ON document_labels(label, doc_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON chunks(doc_id)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_path ON documents(path)`,
];

function configurePragmas(db: Database): void {
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA synchronous = NORMAL");
  db.run("PRAGMA busy_timeout = 5000");
  db.run("PRAGMA foreign_keys = ON");
  db.run("PRAGMA temp_store = MEMORY");
  db.run("PRAGMA cache_size = -2000");
}

function getSchemaVersion(db: Database): number {
  try {
    const row = db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | null;
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
}

function setSchemaVersion(db: Database, version: number): void {
  db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)", [String(version)]);
}

function runMigrations(db: Database, fromVersion: number): void {
  if (fromVersion < 2) {
    db.run("ALTER TABLE documents ADD COLUMN label TEXT NOT NULL DEFAULT ''");
  }
  if (fromVersion < 3) {
    db.run("ALTER TABLE documents ADD COLUMN confidence REAL NOT NULL DEFAULT 0.8");
    db.run("ALTER TABLE documents ADD COLUMN access_count INTEGER NOT NULL DEFAULT 0");
    db.run("ALTER TABLE documents ADD COLUMN last_accessed_at TEXT");
    db.run("ALTER TABLE documents ADD COLUMN pagerank REAL NOT NULL DEFAULT 0.0");
    db.run("ALTER TABLE documents ADD COLUMN doc_type TEXT NOT NULL DEFAULT 'semantic'");
    db.run(`CREATE TABLE IF NOT EXISTS co_access (
      doc_id_a INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      doc_id_b INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      co_count INTEGER NOT NULL DEFAULT 1,
      last_co_access TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (doc_id_a, doc_id_b),
      CHECK (doc_id_a < doc_id_b)
    )`);
  }
}

export let sqliteVecAvailable = false;

function tryLoadSqliteVec(db: Database): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqliteVec = require("sqlite-vec");
    sqliteVec.load(db);
    return true;
  } catch {
    return false;
  }
}

function createVecTable(db: Database, dimensions: number): void {
  db.run(`CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(embedding float[${dimensions}])`);
}

function getStoredDimensions(db: Database): number {
  try {
    const row = db.prepare("SELECT value FROM meta WHERE key = 'embedding_dimensions'").get() as {
      value: string;
    } | null;
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
}

function setStoredDimensions(db: Database, dimensions: number): void {
  db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('embedding_dimensions', ?)", [String(dimensions)]);
}

function handleDimensionMismatch(db: Database): void {
  try {
    db.run("DROP TABLE IF EXISTS chunks_vec");
  } catch {
    // Ignore if vec extension not loaded
  }
  db.run("UPDATE chunks SET embedding = NULL WHERE embedding IS NOT NULL");
  db.run("DELETE FROM embedding_cache");
}

export interface MemoryDb {
  db: Database;
  vecAvailable: boolean;
}

export function openMemoryDb(dbPath: string, embeddingDimensions = 384): MemoryDb {
  let db = new Database(dbPath);
  configurePragmas(db);

  const version = getSchemaVersion(db);
  if (version === 0) {
    for (const stmt of SCHEMA_STATEMENTS) {
      db.run(stmt);
    }
    setSchemaVersion(db, CURRENT_SCHEMA_VERSION);
  } else if (version < CURRENT_SCHEMA_VERSION) {
    // Recreate DB on schema mismatch (no migration for v4)
    db.close();
    if (existsSync(dbPath)) unlinkSync(dbPath);
    // Remove WAL/SHM files if present
    if (existsSync(`${dbPath}-wal`)) unlinkSync(`${dbPath}-wal`);
    if (existsSync(`${dbPath}-shm`)) unlinkSync(`${dbPath}-shm`);
    db = new Database(dbPath);
    configurePragmas(db);
    for (const stmt of SCHEMA_STATEMENTS) {
      db.run(stmt);
    }
    setSchemaVersion(db, CURRENT_SCHEMA_VERSION);
    console.log(`Recreated memory.db due to schema change v${version}→v${CURRENT_SCHEMA_VERSION}`);
  }

  const storedDims = getStoredDimensions(db);
  const dimsChanged = storedDims > 0 && storedDims !== embeddingDimensions;

  if (dimsChanged) {
    handleDimensionMismatch(db);
  }

  let vecAvailable = false;
  if (embeddingDimensions > 0) {
    vecAvailable = tryLoadSqliteVec(db);
    if (vecAvailable) {
      createVecTable(db, embeddingDimensions);
    }
  }

  if (embeddingDimensions !== storedDims) {
    setStoredDimensions(db, embeddingDimensions);
  }

  sqliteVecAvailable = vecAvailable;

  return { db, vecAvailable };
}

export function closeMemoryDb(memDb: MemoryDb): void {
  memDb.db.close();
}

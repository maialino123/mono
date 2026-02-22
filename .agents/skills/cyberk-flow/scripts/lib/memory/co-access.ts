import type { Database } from "bun:sqlite";
import type { RelatedDocument } from "./types";

export function recordCoAccess(db: Database, docIds: number[]): void {
  const unique = [...new Set(docIds)].sort((a, b) => a - b);
  if (unique.length < 2) return;

  const stmt = db.prepare(`
    INSERT INTO co_access (doc_id_a, doc_id_b)
    VALUES (?, ?)
    ON CONFLICT (doc_id_a, doc_id_b) DO UPDATE SET
      co_count = co_count + 1,
      last_co_access = datetime('now')
  `);

  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      stmt.run(unique[i], unique[j]);
    }
  }
}

export function getRelatedDocuments(db: Database, docPath: string, limit = 10): RelatedDocument[] {
  const rows = db
    .prepare(
      `SELECT d.path, ca.co_count, ca.last_co_access
       FROM co_access ca
       JOIN documents d ON d.id = CASE
         WHEN ca.doc_id_a = (SELECT id FROM documents WHERE path = ?) THEN ca.doc_id_b
         ELSE ca.doc_id_a
       END
       WHERE ca.doc_id_a = (SELECT id FROM documents WHERE path = ?1)
          OR ca.doc_id_b = (SELECT id FROM documents WHERE path = ?1)
       ORDER BY ca.co_count DESC
       LIMIT ?`,
    )
    .all(docPath, limit) as { path: string; co_count: number; last_co_access: string }[];

  return rows.map((r) => ({
    path: r.path,
    coAccessCount: r.co_count,
    lastCoAccess: r.last_co_access,
  }));
}

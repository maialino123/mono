import { join } from "node:path";
import { closeMemoryDb, openMemoryDb } from "./lib/memory/db";
import { consolidate } from "./lib/memory/consolidation";

if (import.meta.main) {
  const dbPath = join(process.cwd(), "cyberk-flow", "memory.db");
  const memDb = openMemoryDb(dbPath, 0);

  try {
    const result = await consolidate(memDb.db, memDb.vecAvailable);
    console.log(`Consolidated: ${result.deduplicatedChunks} chunks deduplicated, ${result.prunedDocuments} documents pruned`);
  } finally {
    closeMemoryDb(memDb);
  }
}

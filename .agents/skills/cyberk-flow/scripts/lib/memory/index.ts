import { join } from "node:path";
import { closeMemoryDb, type MemoryDb, openMemoryDb } from "./db";
import { TransformersEmbeddingProvider } from "./embeddings";
import { type IndexContext, indexDocuments } from "./indexer";
import { searchMemory } from "./search";
import type { EmbeddingProvider, IndexSummary, SearchOptions, SearchResult } from "./types";

export interface MemoryStoreOptions {
  provider?: EmbeddingProvider;
  dbPath?: string;
}

export interface MemoryStore {
  index(): Promise<IndexSummary>;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  close(): void;
}

export function createMemoryStore(projectRoot: string, options: MemoryStoreOptions = {}): MemoryStore {
  const provider = options.provider ?? new TransformersEmbeddingProvider();
  const dbPath = options.dbPath ?? join(projectRoot, "cyberk-flow", "memory.db");
  const memDb: MemoryDb = openMemoryDb(dbPath, provider.dimensions);

  return {
    async index(): Promise<IndexSummary> {
      const ctx: IndexContext = {
        db: memDb.db,
        vecAvailable: memDb.vecAvailable,
        provider,
        projectRoot,
      };
      return indexDocuments(ctx);
    },

    async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
      return searchMemory(memDb.db, memDb.vecAvailable, provider, query, options);
    },

    close(): void {
      closeMemoryDb(memDb);
    },
  };
}

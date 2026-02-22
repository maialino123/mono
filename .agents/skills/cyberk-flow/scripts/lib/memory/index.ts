import { join } from "node:path";
import { getRelatedDocuments } from "./co-access";
import { consolidate } from "./consolidation";
import { checkContradictions } from "./contradiction";
import { closeMemoryDb, type MemoryDb, openMemoryDb } from "./db";
import { TransformersEmbeddingProvider } from "./embeddings";
import { type IndexContext, indexDocuments } from "./indexer";
import { searchMemory } from "./search";
import type {
  Contradiction,
  ConsolidationResult,
  EmbeddingProvider,
  IndexSummary,
  RelatedDocument,
  SearchOptions,
  SearchResult,
} from "./types";

export interface MemoryStoreOptions {
  provider?: EmbeddingProvider;
  dbPath?: string;
}

export interface MemoryStore {
  index(): Promise<IndexSummary>;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  gc(): Promise<ConsolidationResult>;
  getRelated(path: string, limit?: number): RelatedDocument[];
  checkContradictions(changePath: string): Promise<Contradiction[]>;
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

    async gc(): Promise<ConsolidationResult> {
      return consolidate(memDb.db, memDb.vecAvailable);
    },

    getRelated(path: string, limit?: number): RelatedDocument[] {
      return getRelatedDocuments(memDb.db, path, limit);
    },

    async checkContradictions(changePath: string): Promise<Contradiction[]> {
      const specsDir = join(projectRoot, "cyberk-flow", "specs");
      return checkContradictions(changePath, specsDir);
    },

    close(): void {
      closeMemoryDb(memDb);
    },
  };
}

export type SearchMode = "keyword" | "vector" | "hybrid";
export type MatchType = "keyword" | "vector" | "hybrid" | "fallback";
export type DocType = "semantic" | "procedural";

export interface SearchResult {
  path: string;
  heading: string | null;
  content: string;
  score: number;
  matchType: MatchType;
  labels: string[];
  docType: DocType;
}

export interface SearchOptions {
  mode?: SearchMode;
  limit?: number;
  labels?: string[];
  docType?: DocType;
  dedupe?: boolean;
  maxChunksPerDoc?: number;
}

export interface Chunk {
  index: number;
  heading: string | null;
  content: string;
}

export interface DocumentRecord {
  id: number;
  path: string;
  contentHash: string;
  chunkCount: number;
  updatedAt: string;
}

export interface IndexSummary {
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
}

export interface EmbeddingProvider {
  readonly modelId: string;
  readonly dimensions: number;
  embed(texts: string[]): Promise<Float32Array[]>;
}

export interface Contradiction {
  source: string;
  target: string;
  energy: number;
  level: "reject" | "warn" | "allow";
  details: string;
}

export interface ConsolidationResult {
  deduplicatedChunks: number;
  prunedDocuments: number;
}

export interface RelatedDocument {
  path: string;
  coAccessCount: number;
  lastCoAccess: string;
}

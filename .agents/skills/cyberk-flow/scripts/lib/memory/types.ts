export type SearchMode = "keyword" | "vector" | "hybrid";
export type MatchType = "keyword" | "vector" | "hybrid" | "fallback";

export interface SearchResult {
  path: string;
  heading: string | null;
  content: string;
  score: number;
  matchType: MatchType;
}

export interface SearchOptions {
  mode?: SearchMode;
  limit?: number;
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

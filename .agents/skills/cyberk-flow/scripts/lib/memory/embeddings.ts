import type { EmbeddingProvider } from "./types";

export class NoopEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = "noop";
  readonly dimensions = 0;

  async embed(_texts: string[]): Promise<Float32Array[]> {
    return [];
  }
}

export class TransformersEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = "Xenova/all-MiniLM-L6-v2";
  readonly dimensions = 384;

  private pipelinePromise: Promise<unknown> | null = null;
  private failed = false;

  async embed(texts: string[]): Promise<Float32Array[]> {
    if (texts.length === 0) return [];

    const extractor = await this.getPipeline();
    if (!extractor) return [];

    const results: Float32Array[] = [];
    for (const text of texts) {
      try {
        const output = await (extractor as CallableFunction)(text, { pooling: "mean", normalize: true });
        const emb = new Float32Array(output.data);
        results.push(emb.length === this.dimensions ? emb : new Float32Array(this.dimensions));
      } catch {
        results.push(new Float32Array(this.dimensions));
      }
    }
    return results;
  }

  private async getPipeline(): Promise<unknown> {
    if (this.pipelinePromise) return this.pipelinePromise;

    this.pipelinePromise = (async () => {
      try {
        const originalWarn = console.warn;
        const warnFilter = (...args: unknown[]) => {
          const msg = args.map(String).join(" ");
          if (msg.includes("dtype")) return;
          originalWarn(...args);
        };
        console.warn = warnFilter;
        try {
          const { pipeline } = await import("@huggingface/transformers");
          const extractor = await pipeline("feature-extraction", this.modelId);
          return extractor;
        } finally {
          if (console.warn === warnFilter) console.warn = originalWarn;
        }
      } catch {
        this.failed = true;
        return null;
      }
    })();

    return this.pipelinePromise;
  }
}

import type { Context, Env } from "hono";

export interface BaseCacheOptions {
  ttl?: number;
}

export type HTTPCacheKeyGenerator<E extends Env = Env> =
  | string
  | ((c: Context<E>) => string | Promise<string>);

export interface HTTPCacheOptions<E extends Env = Env> extends BaseCacheOptions {
  key?: HTTPCacheKeyGenerator<E>;
  condition?: (c: Context<E>) => boolean;
}

export type ORPCCacheKeyGenerator<TInput> =
  | string
  | ((input: TInput, path: readonly string[]) => string);

export interface ORPCCacheOptions<TInput = unknown> extends BaseCacheOptions {
  key?: ORPCCacheKeyGenerator<TInput>;
}

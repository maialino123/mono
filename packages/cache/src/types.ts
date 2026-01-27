import type { Context, Env } from "hono";
import type { InvalidateKeyGenerator } from "./utils";

export interface BaseCacheOptions {
  ttl?: number;
}

// HTTP Types
export type HTTPCacheKeyGenerator<E extends Env = Env> = string | ((c: Context<E>) => string | Promise<string>);

export interface HTTPCacheOptions<E extends Env = Env> extends BaseCacheOptions {
  key?: HTTPCacheKeyGenerator<E>;
  condition?: (c: Context<E>) => boolean;
}

export type HTTPInvalidateKeyGenerator<E extends Env = Env> =
  | string
  | string[]
  | ((c: Context<E>) => string | string[] | Promise<string | string[]>);

export interface HTTPInvalidateOptions<E extends Env = Env> {
  keys: HTTPInvalidateKeyGenerator<E>;
}

// oRPC Types
export type ORPCCacheKeyGenerator<TInput> = string | ((input: TInput, path: readonly string[]) => string);
export type ORPCTagGenerator<TInput> = string | ((input: TInput) => string);

export interface ORPCCacheOptions<TInput = unknown> extends BaseCacheOptions {
  key?: ORPCCacheKeyGenerator<TInput>;
  tag?: ORPCTagGenerator<TInput>;
}

export interface ORPCInvalidateOptions<TInput = unknown> {
  keys?: InvalidateKeyGenerator<TInput>;
  tags?: InvalidateKeyGenerator<TInput>;
}

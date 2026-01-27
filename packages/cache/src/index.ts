export { httpCache, httpInvalidate } from "./http";
export { orpcCache, orpcInvalidate } from "./orpc";
export type {
  BaseCacheOptions,
  HTTPCacheKeyGenerator,
  HTTPCacheOptions,
  HTTPInvalidateKeyGenerator,
  HTTPInvalidateOptions,
  ORPCCacheKeyGenerator,
  ORPCCacheOptions,
  ORPCInvalidateOptions,
} from "./types";
export type { InvalidateKeyGenerator } from "./utils";

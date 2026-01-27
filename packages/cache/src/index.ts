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
  ORPCTagGenerator,
} from "./types";
export type { InvalidateKeyGenerator } from "./utils";
export { cacheWithTag, invalidateByTag, invalidateTags } from "./utils";

import { getRedis } from "@cyberk-flow/db/redis";
import { os } from "@orpc/server";
import type { ORPCCacheOptions, ORPCInvalidateOptions } from "./types";
import { cacheWithTag, invalidateKeys, invalidateTags, resolveKeys, resolveTags } from "./utils";

const DEFAULT_TTL = 60;

export function orpcCache<TInput = unknown>(options: ORPCCacheOptions<TInput> = {}) {
  return os.middleware(async ({ next, path }, input: TInput, output) => {
    const key = options.key
      ? typeof options.key === "function"
        ? options.key(input, path)
        : options.key
      : path.join("/") + JSON.stringify(input);

    const tag = options.tag ? (typeof options.tag === "function" ? options.tag(input) : options.tag) : undefined;

    const redis = getRedis();
    const cachedValue = await redis.get(key);
    if (cachedValue) {
      return output(JSON.parse(cachedValue));
    }

    const result = await next({});
    if (result.output) {
      const ttl = options.ttl ?? DEFAULT_TTL;
      if (tag) {
        await cacheWithTag(key, tag, JSON.stringify(result.output), ttl);
      } else {
        await redis.setex(key, ttl, JSON.stringify(result.output));
      }
    }
    return result;
  });
}

export function orpcInvalidate<TInput = unknown>(options: ORPCInvalidateOptions<TInput>) {
  return os.middleware(async ({ next }, input: TInput) => {
    const result = await next({});

    if (result.output) {
      const keys = resolveKeys(options.keys, input);
      const tags = resolveTags(options.tags, input);
      await Promise.all([invalidateKeys(keys), invalidateTags(tags)]);
    }

    return result;
  });
}

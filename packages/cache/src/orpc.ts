import { getRedis } from "@cyberk-flow/db/redis";
import { os } from "@orpc/server";
import type { ORPCCacheOptions } from "./types";

const DEFAULT_TTL = 2;

export function cacheMiddleware<TInput = unknown>(options: ORPCCacheOptions<TInput> = {}) {
  return os.middleware(async ({ next, path }, input: TInput, output) => {
    const key = options.key
      ? typeof options.key === "function"
        ? options.key(input, path)
        : options.key
      : path.join("/") + JSON.stringify(input);

    const redis = getRedis();
    const cachedValue = await redis.get(key);
    if (cachedValue) {
      return output(JSON.parse(cachedValue));
    }

    const result = await next({});
    if (result.output) {
      await redis.setex(key, options.ttl ?? DEFAULT_TTL, JSON.stringify(result.output));
    }
    return result;
  });
}

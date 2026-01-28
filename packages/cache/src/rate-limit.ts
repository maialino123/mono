import { getRedis } from "@cyberk-flow/db/redis";
import { type RedisClient, RedisStore } from "@hono-rate-limiter/redis";

export type RateLimitStoreOptions = {
  prefix?: string;
  resetExpiryOnChange?: boolean;
};

function createIoRedisAdapter(): RedisClient {
  const redis = getRedis();
  return {
    scriptLoad: (script: string) => redis.script("LOAD", script) as Promise<string>,
    evalsha: <TArgs extends unknown[], TData = unknown>(sha1: string, keys: string[], args: TArgs) =>
      redis.evalsha(sha1, keys.length, ...keys, ...(args as (string | number)[])) as Promise<TData>,
    decr: (key: string) => redis.decr(key),
    del: (key: string) => redis.del(key),
  };
}

// biome-ignore lint/suspicious/noExplicitAny: Store generic types are complex
export function createRateLimitStore(options: RateLimitStoreOptions = {}): any {
  const { prefix = "rl:", resetExpiryOnChange = false } = options;

  return new RedisStore({
    client: createIoRedisAdapter(),
    prefix,
    resetExpiryOnChange,
  });
}

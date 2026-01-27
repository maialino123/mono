import { getRedis } from "@cyberk-flow/db/redis";

export type InvalidateKeyGenerator<T> = string | string[] | ((input: T) => string | string[]);

export function resolveKeys<T>(keys: InvalidateKeyGenerator<T> | undefined, input: T): string[] {
  if (!keys) return [];
  const resolved = typeof keys === "function" ? keys(input) : keys;
  return Array.isArray(resolved) ? resolved : [resolved];
}

export function resolveTags<T>(tags: InvalidateKeyGenerator<T> | undefined, input: T): string[] {
  return resolveKeys(tags, input);
}

export async function invalidateKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const redis = getRedis();
  await Promise.all(keys.map((k) => redis.del(k)));
}

export async function cacheWithTag(key: string, tag: string, value: string, ttl: number): Promise<void> {
  const redis = getRedis();
  await redis.setex(key, ttl, value);
  await redis.sadd(`tag:${tag}`, key);
  await redis.expire(`tag:${tag}`, ttl);
}

export async function invalidateByTag(tag: string): Promise<void> {
  const redis = getRedis();
  const tagKey = `tag:${tag}`;
  const keys = await redis.smembers(tagKey);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
  await redis.del(tagKey);
}

export async function invalidateTags(tags: string[]): Promise<void> {
  if (tags.length === 0) return;
  await Promise.all(tags.map((t) => invalidateByTag(t)));
}

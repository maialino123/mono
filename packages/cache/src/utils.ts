import { getRedis } from "@cyberk-flow/db/redis";

export type InvalidateKeyGenerator<T> = string | string[] | ((input: T) => string | string[]);

export function resolveKeys<T>(keys: InvalidateKeyGenerator<T>, input: T): string[] {
  const resolved = typeof keys === "function" ? keys(input) : keys;
  return Array.isArray(resolved) ? resolved : [resolved];
}

export async function invalidateKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const redis = getRedis();
  await Promise.all(keys.map((k) => redis.del(k)));
}

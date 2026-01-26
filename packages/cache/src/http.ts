import { createMiddleware } from "hono/factory";
import type { Env } from "hono";
import { getRedis } from "@cyberk-flow/db/redis";
import type { HTTPCacheOptions } from "./types";

const DEFAULT_TTL = 2;

export function cache<E extends Env = Env>(options: HTTPCacheOptions<E> = {}) {
  return createMiddleware<E>(async (c, next) => {
    if (c.req.method !== "GET") {
      return next();
    }

    if (options.condition && !options.condition(c)) {
      return next();
    }

    const key = options.key
      ? typeof options.key === "function"
        ? await options.key(c)
        : options.key
      : c.req.url;

    const redis = getRedis();
    const cachedValue = await redis.get(key);
    if (cachedValue) {
      c.header("X-Cache", "HIT");
      return c.json(JSON.parse(cachedValue));
    }

    await next();

    if (c.res.ok) {
      const response = c.res.clone();
      const body = await response.text();
      if (body) {
        await redis.setex(key, options.ttl ?? DEFAULT_TTL, body);
      }
    }
    c.header("X-Cache", "MISS");
  });
}

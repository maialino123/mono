import Redis from "ioredis";
import { env } from "@cyberk-flow/env/server";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    if (!env.REDIS_URL) {
      throw new Error("REDIS_URL environment variable is not set");
    }
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return client;
}

export function closeRedis(): Promise<void> {
  if (client) {
    const currentClient = client;
    client = null;
    return currentClient.quit().then(() => {});
  }
  return Promise.resolve();
}

interface ClickEvent {
  slug: string;
  timestamp: number;
  referrer: string;
  userAgent: string;
}

// Type for Cloudflare KV namespace (injected at runtime)
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

// For Cloudflare Pages Functions
export async function trackClick(
  kv: KVNamespace,
  event: ClickEvent
): Promise<void> {
  const key = `click:${event.slug}:${Date.now()}`;
  await kv.put(key, JSON.stringify(event), {
    expirationTtl: 60 * 60 * 24 * 30, // 30 days
  });

  // Increment counter
  const countKey = `count:${event.slug}`;
  const current = parseInt(await kv.get(countKey) || '0', 10);
  await kv.put(countKey, String(current + 1));
}

export async function getClickCount(
  kv: KVNamespace,
  slug: string
): Promise<number> {
  const count = await kv.get(`count:${slug}`);
  return parseInt(count || '0', 10);
}

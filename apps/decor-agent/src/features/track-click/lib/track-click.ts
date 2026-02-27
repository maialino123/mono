// For use in API route or server action
interface ClickEvent {
  slug: string;
  source: string;
  referrer: string;
  timestamp: number;
  userAgent?: string;
}

export async function recordClick(event: ClickEvent): Promise<void> {
  // Option 1: Cloudflare KV (when deployed)
  // Option 2: Console log for local dev

  if (process.env.NODE_ENV === 'development') {
    console.log('[CLICK]', event);
    return;
  }

  // Cloudflare KV will be injected via env in production
  // See Phase 7 for Cloudflare Pages Function setup
}

export function parseClickFromRequest(
  body: unknown,
  headers: Headers
): ClickEvent | null {
  if (!body || typeof body !== 'object') return null;

  const { slug, source, referrer, timestamp } = body as Record<string, unknown>;

  if (typeof slug !== 'string') return null;

  return {
    slug,
    source: String(source || 'unknown'),
    referrer: String(referrer || ''),
    timestamp: Number(timestamp) || Date.now(),
    userAgent: headers.get('user-agent') || undefined,
  };
}

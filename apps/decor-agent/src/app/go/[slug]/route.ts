import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/entities/product';
import { recordClick } from '@/features/track-click';

// Allowlist of trusted affiliate domains (exact match + specific subdomains)
const ALLOWED_DOMAINS = new Set([
  'shope.ee',
  'shopee.vn',
  's.shopee.vn',
  'lazada.vn',
  's.lazada.vn',
  'tiki.vn',
  'amazon.com',
  'amzn.to',
  'www.amazon.com',
  'www.lazada.vn',
  'www.tiki.vn',
]);

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // SECURITY: Use exact match only to prevent subdomain injection attacks
    // e.g., "attacker.amzn.to" would NOT match "amzn.to"
    return ALLOWED_DOMAINS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // SECURITY: Validate affiliate URL against allowlist
  if (!isAllowedUrl(product.affiliateUrl)) {
    console.error(`[SECURITY] Blocked redirect to untrusted domain: ${product.affiliateUrl}`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Track click (async, don't block)
  recordClick({
    slug,
    source: 'redirect',
    referrer: request.headers.get('referer') || '',
    timestamp: Date.now(),
    userAgent: request.headers.get('user-agent') || undefined,
  });

  // 302 redirect (not 301 - safer for bots)
  return NextResponse.redirect(product.affiliateUrl, { status: 302 });
}

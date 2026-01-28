import type { Context } from "hono";
import { getConnInfo } from "hono/bun";

/**
 * Get real client IP address using multiple sources with proper priority:
 * 1. Hono's getConnInfo() - real socket address (cannot be spoofed)
 * 2. CF-Connecting-IP - Cloudflare's client IP header
 * 3. X-Real-IP - Common reverse proxy header
 * 4. X-Forwarded-For - Standard proxy header (first IP)
 */
export function getClientIP(c: Context): string {
  // 1. Try Hono's getConnInfo (real socket address - most reliable)
  try {
    const info = getConnInfo(c);
    if (info.remote.address) {
      return normalizeIP(info.remote.address);
    }
  } catch {
    // getConnInfo may not be available in all environments
  }

  // 2. Cloudflare's CF-Connecting-IP (trusted, single IP)
  const cfIP = c.req.header("cf-connecting-ip");
  if (cfIP) {
    return normalizeIP(cfIP);
  }

  // 3. X-Real-IP (common with nginx)
  const realIP = c.req.header("x-real-ip");
  if (realIP) {
    return normalizeIP(realIP);
  }

  // 4. X-Forwarded-For (first/leftmost IP is original client)
  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    const firstIP = xff.split(",")[0]?.trim();
    if (firstIP) {
      return normalizeIP(firstIP);
    }
  }

  return "unknown";
}

/**
 * Normalize IP address (handle IPv6 mapped IPv4, etc.)
 */
function normalizeIP(ip: string): string {
  // Remove IPv6 prefix for IPv4-mapped addresses (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }
  return ip;
}

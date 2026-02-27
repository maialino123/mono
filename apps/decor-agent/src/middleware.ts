import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Option 1: Basic Auth for pre-Tina protection
    const authHeader = request.headers.get('authorization');

    if (process.env.ADMIN_BASIC_AUTH) {
      if (!authHeader || !isValidBasicAuth(authHeader)) {
        return new NextResponse('Authentication required', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
          },
        });
      }
    }

    // Option 2: IP Allowlist (optional)
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
    if (allowedIPs.length > 0) {
      const clientIP = request.headers.get('cf-connecting-ip')
        || request.headers.get('x-forwarded-for')?.split(',')[0]
        || 'unknown';

      if (!allowedIPs.includes(clientIP)) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

function isValidBasicAuth(authHeader: string): boolean {
  const [type, credentials] = authHeader.split(' ');
  if (type !== 'Basic' || !credentials) return false;

  const decoded = Buffer.from(credentials, 'base64').toString();
  return decoded === process.env.ADMIN_BASIC_AUTH;
}

export const config = {
  matcher: ['/admin/:path*'],
};

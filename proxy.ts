import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from './lib/auth-jwt';

// Define public route paths
const PUBLIC_PATHS = [
  '/',
  '/authentication',
  '/onboarding',
  '/market',
  '/schemes',
  '/full-crop-guide',
  '/alternative-crop',
  '/financial-support',
  '/financial-support/list',
  '/financial-support/detail',
  '/financial-support/acknowledgement',
  '/ai-chat',
  '/unauthorized',
  '/admin/dashboard',
  '/officer-dashboard/map',
  '/agriculture-officer-dashboard',
  '/officer-dashboard',
  '/officer-dashboard/farmers',
];

// Define public API route prefixes
const PUBLIC_API_PREFIXES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/farmer/register',
  '/api/banks/register',
  '/api/db-check',
  '/api/facilities',
  '/api/translate',
  '/api/sarvam',
  '/api/filter',
  '/api/locate',
  '/api/ai/',
];

// Admin / Officer only routes
const ADMIN_ROUTE_PREFIXES = [
  '/admin/settings',
  '/government/admin',
];

// Bank Partner only routes
const BANK_ROUTE_PREFIXES = [
  '/bank',
  '/bank-portal',
  '/bank-insurance',
  '/api/banks',
];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public static assets and system internal paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Check if route is a public API or public UI page
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isPublicUi =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/schemes/') ||
    pathname.startsWith('/full-crop-guide') ||
    pathname.startsWith('/financial-support');

  // 3. Extract auth credentials from cookies or Authorization header
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  let token = req.cookies.get('smartcrop_token')?.value;

  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  let sessionUser: { id?: string; role?: string; name?: string; email?: string } | null = null;

  // Check signed JWT token first
  if (token) {
    const verified = verifyJwt(token);
    if (verified.valid && verified.payload) {
      sessionUser = verified.payload;
    }
  }

  // Fallback check session cookie if present
  if (!sessionUser) {
    const sessionCookie = req.cookies.get('smartcrop_session')?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        if (parsed && parsed.id && parsed.role) {
          sessionUser = parsed;
        }
      } catch {
        // invalid session format
      }
    }
  }

  const isAuthenticated = !!sessionUser;
  const rawRole = sessionUser?.role || '';
  const userRole = rawRole === 'admin' ? 'administrator' : rawRole;

  // 4. If user is authenticated and visits /authentication, redirect to their role dashboard
  if (isAuthenticated && pathname === '/authentication') {
    let dashboardUrl = '/dashboard';
    if (userRole === 'administrator') {
      dashboardUrl = '/admin/dashboard';
    } else if (userRole === 'bank') {
      dashboardUrl = '/bank-portal/dashboard';
    }
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // 5. If route is public, allow access
  if (isPublicApi || isPublicUi) {
    return NextResponse.next();
  }

  // 6. If unauthenticated user tries to access protected route
  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: {
            code: 'unauthorized',
            message: 'Authentication required to access this resource. Please sign in.',
          },
        },
        { status: 401 }
      );
    }

    const redirectUrl = new URL('/authentication', req.url);
    redirectUrl.searchParams.set('redirectUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 7. RBAC: Admin / Officer routes
  const isAdminRoute = ADMIN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAdminRoute && userRole !== 'administrator') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: {
            code: 'forbidden',
            message: 'Access denied. Administrator / Agriculture Officer privileges required.',
          },
        },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // 8. RBAC: Bank Partner routes
  const isBankRoute = BANK_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isBankRoute && userRole !== 'bank' && userRole !== 'administrator') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: {
            code: 'forbidden',
            message: 'Access denied. Bank Partner privileges required.',
          },
        },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

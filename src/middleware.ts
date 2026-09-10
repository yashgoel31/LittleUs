import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'little_us_session';
const DEFAULT_SECRET = 'little-us-dev-secret-key-32-chars-long-intimate-space';

const PROTECTED_ROUTES = ['/home', '/memories', '/notes', '/letters', '/dates', '/settings', '/onboarding', '/upgrade', '/join'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isValidSession = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET || DEFAULT_SECRET);
      await jwtVerify(token, secret);
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // 1. If accessing protected routes without valid session -> redirect to /login
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !isValidSession) {
    const loginUrl = new URL('/login', request.url);
    const fullTarget = pathname + (request.nextUrl.search || '');
    loginUrl.searchParams.set('callbackUrl', fullTarget);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }

  // 2. If accessing auth routes (login/register) while already logged in -> redirect to /home
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && isValidSession) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/memories/:path*',
    '/notes/:path*',
    '/letters/:path*',
    '/dates/:path*',
    '/settings/:path*',
    '/upgrade/:path*',
    '/onboarding',
    '/join',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};

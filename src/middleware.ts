import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to validate token
function validateToken(token: string): boolean {
  try {
    if (!token) return false;
    
    const payload = JSON.parse(atob(token));
    
    // Check if token is expired
    if (payload.exp < Date.now()) {
      return false;
    }
    
    return true;
  } catch (_) {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isAuthApiRoute = request.nextUrl.pathname === '/api/auth/login';
  
  // Skip middleware check for the login page and auth API
  if (isLoginPage || isAuthApiRoute) {
    return NextResponse.next();
  }

  // Get token from cookies or authorization header
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Validate the token
  const isValidToken = token ? validateToken(token) : false;
  
  // Check if accessing API route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // If invalid token and it's an API route, return unauthorized
  if (isApiRoute && !isValidToken) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // For UI routes with invalid token, redirect to login
  if (!isValidToken && !isApiRoute) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip public files and server routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 
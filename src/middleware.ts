import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';
  
  // Skip middleware check for the login page
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Get token from cookies or authorization header
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if accessing API route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // If no token and it's an API route, return unauthorized
  if (isApiRoute && !token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // For UI routes without token, redirect to login
  if (!token && !isApiRoute) {
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
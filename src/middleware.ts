import { NextRequest, NextResponse } from 'next/server';

// Define which routes are public (don't require auth)
const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

export function middleware(request: NextRequest) {
  // Get the path being requested
  const path = request.nextUrl.pathname;
  
  // Define paths that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/api/health', // if you have a health check endpoint
    '/api/auth',   // auth-related API endpoints
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(publicPath + '/') ||
    path.startsWith('/_next/') ||
    path.includes('favicon.ico')
  );
  
  // Get the token from the cookies - check both possible cookie names
  const authToken = request.cookies.get('auth_token')?.value;
  const nextpropToken = request.cookies.get('nextprop_token')?.value;
  
  // Validate the token(s) - at minimum check that they're 20+ characters
  const isValidToken = (token: string | undefined): boolean => {
    return !!token && token.length >= 20;
  };
  
  // Check if either token is valid
  const hasValidToken = isValidToken(authToken) || isValidToken(nextpropToken);
  
  // If it's a protected path and there's no valid token, redirect to login
  if (!isPublicPath && !hasValidToken) {
    
    // If it's an API route, return a 401 Unauthorized response instead of redirecting
    if (path.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // For regular routes, redirect to login
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('from', path);
    url.searchParams.set('message', 'Please sign in to access this page');
    return NextResponse.redirect(url);
  }
  
  // Otherwise, continue
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 
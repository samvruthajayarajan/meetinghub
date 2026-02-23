import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log('Middleware check:', { path, hasToken: !!token });

    // Redirect authenticated users from signin to user dashboard
    if (path === '/auth/signin' && token) {
      return NextResponse.redirect(new URL('/user', req.url));
    }

    // Dashboard route - redirect to user dashboard
    if (path === '/dashboard') {
      return NextResponse.redirect(new URL('/user', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        console.log('Auth check:', { path, hasToken: !!token });
        
        // Public routes
        if (path === '/' || path === '/auth/signin' || path === '/auth/register' || path === '/manifest.json') {
          return true;
        }
        
        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/user/:path*',
    '/dashboard/:path*',
    '/meetings/:path*',
    '/auth/signin',
    '/auth/register',
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};

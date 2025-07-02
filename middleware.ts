import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    console.log(`🔒 Middleware: ${pathname} | Token: ${!!token?.email}`);

    // =============================================
    // API ROUTES PROTECTION
    // =============================================
    if (pathname.startsWith('/api')) {
      // Allow public auth endpoints
      if (pathname.startsWith('/api/auth/')) {
        console.log(`✅ Allowing auth endpoint: ${pathname}`);
        return NextResponse.next();
      }

      // Protect all other API routes
      if (!token?.email) {
        console.log(`❌ Blocking API access (no token): ${pathname}`);
        return NextResponse.json(
          { 
            error: "Unauthorized", 
            message: "Authentication required to access this API endpoint",
            endpoint: pathname,
            timestamp: new Date().toISOString()
          },
          { status: 401 }
        );
      }

      console.log(`✅ API access granted for: ${token.email} -> ${pathname}`);
      return NextResponse.next();
    }

    // =============================================
    // PANEL ROUTES PROTECTION  
    // =============================================
    if (pathname.startsWith('/panel')) {
      if (!token?.email) {
        console.log(`❌ Redirecting to signin from panel: ${pathname}`);
        return NextResponse.redirect(new URL('/api/auth/signin', req.url));
      }
      
      console.log(`✅ Panel access granted for: ${token.email}`);
      return NextResponse.next();
    }

    // =============================================
    // PANITIA ROUTES PROTECTION
    // =============================================
    if (pathname.startsWith('/panitia')) {
      if (!token?.email) {
        console.log(`❌ Redirecting to signin from panitia: ${pathname}`);
        return NextResponse.redirect(new URL('/api/auth/signin', req.url));
      }

      // Optional: Add divisi-specific checks here if needed
      // Note: Database access tidak bisa langsung di middleware
      console.log(`✅ Panitia access granted for: ${token.email}`);
      return NextResponse.next();
    }

    // =============================================
    // DASHBOARD ROUTES PROTECTION
    // =============================================
    if (pathname.startsWith('/dashboard')) {
      if (!token?.email) {
        console.log(`❌ Redirecting to signin from dashboard: ${pathname}`);
        return NextResponse.redirect(new URL('/api/auth/signin', req.url));
      }

      console.log(`✅ Dashboard access granted for: ${token.email}`);
      return NextResponse.next();
    }

    // Default: allow other routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // API Routes Authorization
        if (pathname.startsWith('/api')) {
          // Always allow auth endpoints
          if (pathname.startsWith('/api/auth/')) {
            return true;
          }
          // Require token for all other API routes
          return !!token?.email;
        }

        // Panel Routes Authorization
        if (pathname.startsWith('/panel')) {
          return !!token?.email;
        }

        // Panitia Routes Authorization  
        if (pathname.startsWith('/panitia')) {
          return !!token?.email;
        }

        // Dashboard Routes Authorization
        if (pathname.startsWith('/dashboard')) {
          return !!token?.email;
        }

        // Allow all other routes by default
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // API routes protection
    '/api/:path*',
    
    // Existing protected routes
    '/panel/:path*',
    '/panitia/:path*', 
    '/dashboard/:path*',
    
    // Additional protected routes (optional)
    '/admin/:path*',
    '/protected/:path*'
  ]
};
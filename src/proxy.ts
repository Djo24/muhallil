import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup";

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        if (path === "/api/auth/signup" || path.startsWith("/api/webhooks")) {
          return true;
        }
        if (path.startsWith("/dashboard") || path.startsWith("/api/documents") || path.startsWith("/api/user")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/signup", "/api/:path*"],
};

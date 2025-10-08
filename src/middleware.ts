import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const { pathname } = request.nextUrl;

  // Allow access to sign-in and sign-up pages
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    // If already authenticated, redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL("/dashboard/properties", request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      // Not authenticated, redirect to sign-in
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check role-based access for certain routes
    if (pathname.startsWith("/dashboard/properties/create")) {
      const userRole = token.role as string;
      if (!["AGENT", "ADMIN"].includes(userRole)) {
        // Redirect to properties page if not authorized
        return NextResponse.redirect(new URL("/dashboard/properties", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Protect specific routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up"
  ],
};

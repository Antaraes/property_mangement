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

    const userRole = token.role as string;

    // Agents tab - only ADMIN and SUPERADMIN
    if (pathname.startsWith("/dashboard/agents")) {
      if (!["ADMIN", "SUPERADMIN"].includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard/properties", request.url));
      }
    }

    // Documents - only AGENT, ADMIN, SUPERADMIN
    if (pathname.startsWith("/dashboard/documents")) {
      if (!["AGENT", "ADMIN", "SUPERADMIN"].includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard/properties", request.url));
      }
    }

    // Settings management - only ADMIN and SUPERADMIN
    if (pathname.startsWith("/dashboard/settings") && !pathname.startsWith("/dashboard/settings/profile")) {
      if (!["ADMIN", "SUPERADMIN"].includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard/settings/profile", request.url));
      }
    }

    // Property creation - AGENT, ADMIN, SUPERADMIN only
    if (pathname.startsWith("/dashboard/properties/create")) {
      if (!["AGENT", "ADMIN", "SUPERADMIN"].includes(userRole)) {
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

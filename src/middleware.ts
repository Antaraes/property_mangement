import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // If user is not authenticated, redirect to sign-in
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// Protect specific routes
export const config = {
  matcher: ["/dashboard/:path*"], // Define protected routes
};

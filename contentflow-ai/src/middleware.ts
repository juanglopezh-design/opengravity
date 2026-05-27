import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllowedOrigins } from "@/lib/config";

const allowedOrigins = getAllowedOrigins();

/**
 * Routes that require authentication.
 * The middleware checks for a Firebase session cookie or Authorization header.
 * Full token verification happens in each API route via requireAuth().
 * Here we do a lightweight presence check to redirect unauthenticated users
 * before they see any protected page HTML.
 */
const PROTECTED_PATHS = ["/dashboard", "/checkout/crypto"];

function corsHeaders(origin: string | null): Headers {
  const headers = new Headers();
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT,PATCH,DELETE");
  headers.set(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Requested-With, Accept"
  );
  return headers;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CORS for API routes ──────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers });
    }

    const response = NextResponse.next();
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  // ── Auth guard for protected pages ───────────────────────────────────────
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected) {
    // Firebase Auth uses client-side tokens, not cookies by default.
    // We check for the Firebase session cookie (set via getIdToken + custom session)
    // OR fall back to a lightweight "was-authenticated" cookie set on login.
    const sessionCookie = request.cookies.get("__session")?.value;
    const authHint = request.cookies.get("cf_auth")?.value;

    if (!sessionCookie && !authHint) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/dashboard", "/checkout/crypto"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllowedOrigins } from "@/lib/config";

const allowedOrigins = getAllowedOrigins();

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
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};

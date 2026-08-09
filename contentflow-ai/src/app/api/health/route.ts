import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "contentflow-ai",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      env: process.env.NODE_ENV,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}

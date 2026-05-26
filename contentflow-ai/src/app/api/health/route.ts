import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "contentflow-ai",
    timestamp: new Date().toISOString(),
  });
}

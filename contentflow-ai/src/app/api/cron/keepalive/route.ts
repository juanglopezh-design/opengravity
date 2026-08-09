import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Endpoint de keep-alive para Render Cron Job.
 * Configura en Render Dashboard > Cron Jobs:
 *   Schedule: * /10 * * * *  (cada 10 minutos)
 *   Command:  curl https://contentflow-ai-9wy7.onrender.com/api/cron/keepalive
 */
export async function GET(request: Request) {
  // Verificación básica de autorización (opcional pero recomendado)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "alive",
    service: "contentflow-ai",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

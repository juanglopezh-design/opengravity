/**
 * Next.js Instrumentation Hook (Next.js 15+)
 * Se ejecuta UNA VEZ al arrancar el servidor, tanto en desarrollo como en producción.
 *
 * Aquí registramos el keep-alive loop interno que hace ping al propio servidor
 * cada 10 minutos para evitar el cold start de Render Free.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Solo en producción y solo en el runtime de Node.js (no en Edge)
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_RUNTIME === "edge"
  ) {
    return;
  }

  const SELF_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://contentflow-ai-9wy7.onrender.com";

  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos
  const PING_URL = `${SELF_URL}/api/health`;

  /**
   * Hace un ping HTTP al propio servidor con retry básico.
   * Silencia todos los errores para no impactar el servidor.
   */
  async function selfPing() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000); // 15s timeout
      const res = await fetch(PING_URL, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        headers: { "User-Agent": "ContentFlow-KeepAlive/1.0" },
      });
      clearTimeout(timeout);
      console.log(
        `[KeepAlive] Ping OK — status: ${res.status} — ${new Date().toISOString()}`
      );
    } catch (err: unknown) {
      // No relanzar — un ping fallido no debe crashear nada
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[KeepAlive] Ping falló (no crítico): ${msg}`);
    }
  }

  // MundoRaw AutoPublish — corre cada hora
  const MUNDORAW_INTERVAL_MS = 60 * 60 * 1000; // 1 hora
  const MUNDORAW_URL = `${SELF_URL}/api/cron/mundoraw`;
  const CRON_SECRET = process.env.CRON_SECRET || "";

  async function mundorawCheck() {
    try {
      const headers: Record<string, string> = { "User-Agent": "ContentFlow-Cron/1.0" };
      if (CRON_SECRET) headers["authorization"] = `Bearer ${CRON_SECRET}`;
      const res = await fetch(MUNDORAW_URL, { method: "GET", cache: "no-store", headers });
      const data = await res.json();
      console.log(`[MundoRaw] Check: ${data.status} | ${data.count ?? 0} nuevo(s) | ${new Date().toISOString()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[MundoRaw] Check falló: ${msg}`);
    }
  }

  // Esperar 30 segundos después del arranque antes del primer ping
  // (dar tiempo a que el servidor esté completamente listo)
  setTimeout(() => {
    selfPing();
    setInterval(selfPing, PING_INTERVAL_MS);
    console.log(
      `[KeepAlive] Loop iniciado — ping cada ${PING_INTERVAL_MS / 60000} min → ${PING_URL}`
    );

    // MundoRaw: primer check a los 5 minutos, luego cada hora
    setTimeout(() => {
      mundorawCheck();
      setInterval(mundorawCheck, MUNDORAW_INTERVAL_MS);
      console.log(`[MundoRaw] AutoPublish iniciado — check cada hora → ${MUNDORAW_URL}`);
    }, 5 * 60 * 1000);
  }, 30_000);
}

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const OWNER_EMAIL = "juanglopezh@gmail.com";
const FROM_EMAIL = "ContentFlow AI <onboarding@resend.dev>";

const planNames: Record<string, string> = {
  basic: "Basic ($1.99/mes)",
  starter: "Starter ($9/mes)",
  pro: "Pro ($29/mes)",
  business: "Business ($79/mes)",
};

const planLimits: Record<string, string> = {
  basic: "10 generaciones/mes",
  starter: "100 generaciones/mes",
  pro: "Generaciones ilimitadas",
  business: "Generaciones ilimitadas + agentes",
};

/** Notificación al dueño cuando se confirma un pago */
export async function sendPaymentNotification({
  userEmail,
  userId,
  planId,
  priceUsd,
  txHash,
  verificationSource,
}: {
  userEmail?: string;
  userId: string;
  planId: string;
  priceUsd: number;
  txHash: string;
  verificationSource: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set — skipping owner notification.");
    return;
  }

  const planLabel = planNames[planId] || planId;
  const date = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `💰 Nuevo pago — Plan ${planLabel}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f1a;color:#e2e8f0;border-radius:12px;">
          <h1 style="color:#a855f7;margin-bottom:4px;">⚡ ContentFlow AI</h1>
          <h2 style="color:#f1f5f9;margin-top:0;">Nuevo pago confirmado</h2>
          <div style="background:#1e1b4b;border-radius:8px;padding:20px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#94a3b8;">Plan</td><td style="padding:8px 0;font-weight:bold;color:#a855f7;">${planLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Monto</td><td style="padding:8px 0;font-weight:bold;color:#10b981;">$${priceUsd} USD en BTC</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Usuario</td><td style="padding:8px 0;">${userEmail || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">User ID</td><td style="padding:8px 0;font-size:12px;color:#64748b;">${userId}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">TX Hash</td><td style="padding:8px 0;font-size:11px;color:#64748b;word-break:break-all;">${txHash}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Verificado en</td><td style="padding:8px 0;">${verificationSource}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Fecha</td><td style="padding:8px 0;">${date}</td></tr>
            </table>
          </div>
          <p style="color:#64748b;font-size:13px;margin-top:24px;">
            Ver en <a href="https://console.firebase.google.com/project/contentflow-ai-juang26/firestore" style="color:#a855f7;">Firebase Console</a>.
          </p>
        </div>
      `,
    });
    console.log(`[Email] Owner notified — plan ${planId} from ${userEmail}`);
  } catch (err) {
    console.error("[Email] Owner notification error:", err);
  }
}

/** Confirmación al usuario después de activar su plan */
export async function sendUserPaymentConfirmation({
  userEmail,
  planId,
  txHash,
}: {
  userEmail: string;
  planId: string;
  txHash: string;
}) {
  if (!process.env.RESEND_API_KEY || !userEmail) return;

  const planLabel = planNames[planId] || planId;
  const planLimit = planLimits[planId] || "";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contentflow-ai-9wy7.onrender.com";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `✅ Tu plan ${planLabel} está activo — ContentFlow AI`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#0f0f1a;color:#e2e8f0;border-radius:12px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:48px;margin-bottom:8px;">⚡</div>
            <h1 style="color:#a855f7;margin:0;font-size:24px;">ContentFlow AI</h1>
          </div>

          <h2 style="color:#f1f5f9;font-size:20px;margin-bottom:8px;">¡Tu plan está activo!</h2>
          <p style="color:#94a3b8;margin-bottom:24px;">
            Tu pago con Bitcoin ha sido verificado en la blockchain. Ya puedes usar ContentFlow AI.
          </p>

          <div style="background:#1e1b4b;border-radius:10px;padding:20px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#94a3b8;">Plan activado</span>
              <span style="color:#a855f7;font-weight:700;text-transform:capitalize;">${planLabel}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#94a3b8;">Generaciones</span>
              <span style="color:#f1f5f9;font-weight:600;">${planLimit}</span>
            </div>
            <div style="border-top:1px solid #334155;padding-top:12px;margin-top:4px;">
              <span style="color:#64748b;font-size:12px;">TX: ${txHash.slice(0, 20)}...${txHash.slice(-8)}</span>
            </div>
          </div>

          <div style="text-align:center;margin-bottom:24px;">
            <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;text-decoration:none;font-size:16px;">
              Ir al Dashboard →
            </a>
          </div>

          <p style="color:#64748b;font-size:13px;text-align:center;">
            ¿Tienes algún problema? Escríbenos a
            <a href="mailto:juanglopezh@gmail.com" style="color:#a855f7;"> juanglopezh@gmail.com</a>
          </p>
        </div>
      `,
    });
    console.log(`[Email] Confirmation sent to ${userEmail} — plan ${planId}`);
  } catch (err) {
    console.error("[Email] User confirmation error:", err);
  }
}

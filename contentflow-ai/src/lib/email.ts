import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const OWNER_EMAIL = "juanglopezh@gmail.com";
const FROM_EMAIL = "ContentFlow AI <onboarding@resend.dev>";

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
    console.warn("[Email] RESEND_API_KEY not set — skipping email notification.");
    return;
  }

  const planNames: Record<string, string> = {
    basic: "Basic ($1.99/mes)",
    starter: "Starter ($9/mes)",
    pro: "Pro ($29/mes)",
    business: "Business ($79/mes)",
  };

  const planLabel = planNames[planId] || planId;
  const date = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `💰 Nuevo pago — Plan ${planLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f0f1a; color: #e2e8f0; border-radius: 12px;">
          <h1 style="color: #a855f7; margin-bottom: 4px;">⚡ ContentFlow AI</h1>
          <h2 style="color: #f1f5f9; margin-top: 0;">Nuevo pago confirmado</h2>

          <div style="background: #1e1b4b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Plan</td>
                <td style="padding: 8px 0; font-weight: bold; color: #a855f7;">${planLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Monto</td>
                <td style="padding: 8px 0; font-weight: bold; color: #10b981;">$${priceUsd} USD en BTC</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Usuario</td>
                <td style="padding: 8px 0;">${userEmail || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">User ID</td>
                <td style="padding: 8px 0; font-size: 12px; color: #64748b;">${userId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">TX Hash</td>
                <td style="padding: 8px 0; font-size: 11px; color: #64748b; word-break: break-all;">${txHash}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Verificado en</td>
                <td style="padding: 8px 0;">${verificationSource}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Fecha</td>
                <td style="padding: 8px 0;">${date}</td>
              </tr>
            </table>
          </div>

          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
            Puedes ver todos los pagos en tu 
            <a href="https://console.firebase.google.com/project/contentflow-ai-juang26/firestore" style="color: #a855f7;">Firebase Console</a>.
          </p>
        </div>
      `,
    });

    console.log(`[Email] Notificación enviada a ${OWNER_EMAIL} — plan ${planId} de ${userEmail}`);
  } catch (err) {
    // Never let email failure break the payment flow
    console.error("[Email] Error sending notification:", err);
  }
}

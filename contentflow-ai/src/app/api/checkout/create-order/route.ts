import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { planPricesUsd, planGenerationLimits } from "@/lib/config";

/**
 * POST /api/checkout/create-order
 *
 * Creates a signed order on the server so the orderId is never
 * generated or trusted from the client. Returns the orderId and
 * checkout params to redirect to /checkout/crypto.
 */
export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) return authResult.response;
    const userId = authResult.uid;

    const body = await req.json();
    const { planId } = body;

    if (!planId || typeof planId !== "string") {
      return NextResponse.json({ error: "planId es requerido." }, { status: 400 });
    }

    const validPlans = Object.keys(planPricesUsd);
    if (!validPlans.includes(planId)) {
      return NextResponse.json({ error: "Plan no válido." }, { status: 400 });
    }

    if (planId === "free") {
      return NextResponse.json({ error: "El plan free no requiere pago." }, { status: 400 });
    }

    if (!planGenerationLimits[planId]) {
      return NextResponse.json({ error: "Plan no reconocido." }, { status: 400 });
    }

    // Generate orderId server-side — client cannot forge this
    const orderId = `${userId}___${planId}___${Date.now()}`;
    const priceUsd = planPricesUsd[planId];

    return NextResponse.json({ orderId, planId, priceUsd });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    console.error("[CreateOrder] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

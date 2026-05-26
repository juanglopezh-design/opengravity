import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured on this server." }, { status: 503 });
  }

  try {
    const { priceId, planId, userId, userEmail } = await req.json();

    let actualPriceId = priceId;
    if (planId) {
      if (planId === "pro") {
        actualPriceId = process.env.STRIPE_PRO_PRICE_ID;
      } else if (planId === "starter") {
        actualPriceId = process.env.STRIPE_STARTER_PRICE_ID;
      }
    }

    if (!actualPriceId || !userId) {
      return NextResponse.json({ error: "Missing required fields: priceId/planId or userId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


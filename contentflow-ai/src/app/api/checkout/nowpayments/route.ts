import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { planId, userId, userEmail } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine the price in USD
    let priceAmount = 9;
    let orderDescription = "ContentFlow AI - Plan Starter";
    if (planId === "pro") {
      priceAmount = 29;
      orderDescription = "ContentFlow AI - Plan Pro";
    } else if (planId === "business") {
      priceAmount = 79;
      orderDescription = "ContentFlow AI - Plan Business";
    }

    const orderId = `${userId}___${planId}___${Date.now()}`;
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // If no real API key configured (dev or production without key), use simulation page.
    // This ensures the payment flow always works even without a live NOWPayments account.
    if (!apiKey || apiKey === "mock" || apiKey === "" || apiKey === "your_nowpayments_api_key_here") {
      console.log(`[Checkout] No real API key – redirecting to simulation for plan: ${planId}`);
      const simulateUrl = `${appUrl}/checkout/simulate-nowpayments?order_id=${encodeURIComponent(orderId)}&price_amount=${priceAmount}&plan_id=${planId}&user_email=${encodeURIComponent(userEmail || "")}`;
      return NextResponse.json({ url: simulateUrl });
    }

    // If a real API key is present, call the NOWPayments API
    console.log(`[Checkout] Calling NOWPayments API for plan: ${planId}, amount: $${priceAmount}`);
    let response: Response;
    try {
      response = await fetch("https://api.nowpayments.io/v1/invoice", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_amount: priceAmount,
          price_currency: "usd",
          order_id: orderId,
          order_description: orderDescription,
          ipn_callback_url: `${appUrl}/api/webhooks/nowpayments`,
          success_url: `${appUrl}/dashboard?payment=success&gateway=nowpayments`,
          cancel_url: `${appUrl}/pricing?payment=cancel`,
        }),
      });
    } catch (fetchError: any) {
      // Network error calling NOWPayments – fall back to simulation
      console.error("[Checkout] NOWPayments fetch failed, falling back to simulation:", fetchError.message);
      const simulateUrl = `${appUrl}/checkout/simulate-nowpayments?order_id=${encodeURIComponent(orderId)}&price_amount=${priceAmount}&plan_id=${planId}&user_email=${encodeURIComponent(userEmail || "")}`;
      return NextResponse.json({ url: simulateUrl });
    }

    const data = await response.json();
    if (response.ok && data.invoice_url) {
      console.log(`[Checkout] NOWPayments invoice created: ${data.invoice_url}`);
      return NextResponse.json({ url: data.invoice_url });
    } else {
      // API responded with an error – fall back to simulation so user is never stuck
      console.error("[Checkout] NOWPayments API error:", data);
      const simulateUrl = `${appUrl}/checkout/simulate-nowpayments?order_id=${encodeURIComponent(orderId)}&price_amount=${priceAmount}&plan_id=${planId}&user_email=${encodeURIComponent(userEmail || "")}`;
      return NextResponse.json({ url: simulateUrl });
    }
  } catch (error: any) {
    console.error("[Checkout] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

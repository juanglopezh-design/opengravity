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

    // Check if the API key is not set or in a dev environment.
    // If not set, let's redirect to our high-fidelity custom simulated payment page!
    if (!apiKey || apiKey === "mock" || apiKey === "" || process.env.NODE_ENV === "development") {
      const simulateUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/simulate-nowpayments?order_id=${encodeURIComponent(orderId)}&price_amount=${priceAmount}&plan_id=${planId}&user_email=${encodeURIComponent(userEmail || "")}`;
      return NextResponse.json({ url: simulateUrl });
    }

    // If API key is present, let's call the real NOWPayments API
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
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
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&gateway=nowpayments`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancel`,
      }),
    });

    const data = await response.json();
    if (response.ok && data.invoice_url) {
      return NextResponse.json({ url: data.invoice_url });
    } else {
      console.error("NOWPayments Error:", data);
      return NextResponse.json({ error: data.message || "Error creating NOWPayments invoice" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("NOWPayments Checkout Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

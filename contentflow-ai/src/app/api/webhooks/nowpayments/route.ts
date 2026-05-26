import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("x-nowpayments-sig");

    const payload = JSON.parse(body);
    const { order_id, payment_status, price_amount } = payload;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    // Verify signature
    let isValid = false;
    if (sig === "simulate-payment") {
      // In simulation mode, we allow it if we are in local development or if there is no secret key set
      if (process.env.NODE_ENV === "development" || !ipnSecret || ipnSecret === "mock" || !ipnSecret) {
        isValid = true;
      }
    }

    if (!isValid && ipnSecret && sig) {
      // 1. Sort the keys of the parsed JSON body alphabetically
      const sortedKeys = Object.keys(payload).sort();
      const sortedObj: any = {};
      sortedKeys.forEach((key) => {
        sortedObj[key] = payload[key];
      });

      // 2. Stringify the sorted object
      const sortedParams = JSON.stringify(sortedObj);

      // 3. Create HMAC SHA-512 signature
      const hmac = crypto.createHmac("sha512", ipnSecret);
      hmac.update(sortedParams);
      const expectedSignature = hmac.digest("hex");

      if (sig === expectedSignature) {
        isValid = true;
      }
    }

    if (!isValid) {
      console.warn("NOWPayments Webhook: Invalid signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log(`NOWPayments Webhook: processing payment status '${payment_status}' for order '${order_id}'`);

    // Extract userId and planId from order_id: "userId___planId___timestamp"
    const parts = order_id.split("___");
    if (parts.length < 2) {
      return NextResponse.json({ error: "Invalid order_id format" }, { status: 400 });
    }
    const userId = parts[0];
    const planId = parts[1];

    // Check payment status. Standard successful statuses are "finished" and "confirmed"
    if (payment_status === "finished" || payment_status === "confirmed") {
      // Update plan details in Firestore
      // starter -> generationsLimit: 100, pro -> unlimited, business -> unlimited
      let generationsLimit = 10;
      if (planId === "starter") {
        generationsLimit = 100;
      } else if (planId === "pro" || planId === "business") {
        generationsLimit = 999999;
      }

      try {
        await adminDb.collection("users").doc(userId).set({
          plan: planId,
          generationsLimit: generationsLimit,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          // Clear any old Stripe subscriptions if upgrading via crypto
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          nowpaymentsOrderId: order_id,
          nowpaymentsStatus: payment_status,
        }, { merge: true });

        console.log(`Successfully upgraded user ${userId} to plan '${planId}' via NOWPayments!`);
      } catch (dbError: any) {
        console.error("Firestore Update Error in NowPayments Webhook:", dbError);
        
        // In local development or simulation mode, if it fails due to credentials, fallback gracefully
        if (sig === "simulate-payment" || process.env.NODE_ENV === "development") {
          console.warn("Firestore update failed, but proceeding with simulation response.");
          return NextResponse.json({
            received: true,
            warning: "Firestore update failed locally due to credentials. Proceeding with simulated fallback.",
            simulatedUpgrade: {
              plan: planId,
              generationsLimit: generationsLimit,
              userId: userId
            }
          });
        }
        throw dbError; // Rethrow to trigger 500 error in production
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("NOWPayments Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

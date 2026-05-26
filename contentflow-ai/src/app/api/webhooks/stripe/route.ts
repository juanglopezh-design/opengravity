import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import Stripe from "stripe";
import * as admin from "firebase-admin";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) throw new Error("Missing signature or secret");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }


  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.line_items?.data[0]?.price?.id; // Note: session doesn't have line_items by default unless expanded

      if (userId) {
        // We'll fetch the line items if needed, or just use metadata if we added it
        const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items"],
        });
        
        const priceId = checkoutSession.line_items?.data[0]?.price?.id;
        const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? "pro" : "starter";

        await adminDb.collection("users").doc(userId).set({
          plan: plan,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        
        console.log(`User ${userId} upgraded to ${plan}`);
      }
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      const userSnapshot = await adminDb.collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await userDoc.ref.set({
          plan: "free",
          stripeSubscriptionId: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`Subscription deleted for customer ${customerId}`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

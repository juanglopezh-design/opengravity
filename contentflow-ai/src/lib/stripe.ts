import Stripe from "stripe";

// Return null gracefully if Stripe is not configured – other API routes still work
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any,
      typescript: true,
    })
  : null;


import { Stripe as StripeClient, loadStripe } from "@stripe/stripe-js"
import Stripe from "stripe"

// Singleton pattern for Stripe instance
let stripePromise: Promise<StripeClient | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHED_KEY!)
  }
  return stripePromise
}
// Server-side Stripe instance (for actions)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})


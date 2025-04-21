"use server"

import { redirect } from "next/navigation"

// Flouci API configuration
const FLOUCI_API_URL = "https://developers.flouci.com/api"
const APP_TOKEN = "8604b867-9238-4083-8b76-a116f3c6b1a2"
const APP_SECRET = "bc9ff7c5-31d9-4d2a-83ad-a71ae68aad2f"

interface GenerateCarPaymentParams {
  amount: number // in TND; will be converted to millimes (1 TND = 1000 millimes)
  bookingId: number | string
  developerTrackingId?: string
  sessionTimeoutSecs?: number
}

export async function generateCarPaymentLink({
  amount,
  bookingId,
  developerTrackingId = "",
  sessionTimeoutSecs = 1200,
  locale = "en", // Add locale parameter with default
}: GenerateCarPaymentParams & { locale?: string }) {
  try {
    if (amount <= 0) {
      throw new Error("Payment amount must be greater than zero")
    }

    // Ensure amount is in TND (should already be converted by this point)
    console.log(
      `Processing Flouci payment for car booking #${bookingId} - Amount: ${amount} TND`
    )

    // Convert amount from TND to millimes
    const amountInMillimes = Math.round(amount * 1000)

    // Create the base URL for success and failure redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Set car-specific success and failure paths
    const successPath = `/${locale}/cars/payment/success?bookingId=${bookingId}`
    const failPath = `/${locale}/cars/payment/failed?bookingId=${bookingId}`

    const payload = {
      app_token: APP_TOKEN,
      app_secret: APP_SECRET,
      amount: amountInMillimes,
      accept_card: "true",
      session_timeout_secs: sessionTimeoutSecs,
      success_link: `${baseUrl}${successPath}`,
      fail_link: `${baseUrl}${failPath}`,
      developer_tracking_id: developerTrackingId || `booking_${bookingId}`,
    }

    console.log("Payment request payload:", JSON.stringify(payload))

    const response = await fetch(`${FLOUCI_API_URL}/generate_payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Flouci API error response:", errorText)
      throw new Error(`Failed to generate payment link: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.result?.success) {
      throw new Error("Failed to generate payment link")
    }

    return {
      paymentLink: data.result.link,
      paymentId: data.result.payment_id,
    }
  } catch (error) {
    console.error("Error generating car payment link:", error)
    throw error
  }
}

export async function verifyCarPayment(paymentId: string) {
  try {
    const response = await fetch(
      `${FLOUCI_API_URL}/payment_intent/${paymentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to verify payment: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error verifying car payment:", error)
    throw error
  }
}

export async function redirectToCarPayment(paymentLink: string) {
  redirect(paymentLink)
}

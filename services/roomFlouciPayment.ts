"use server"

import { redirect } from "next/navigation"

const FLOUCI_API_URL = "https://developers.flouci.com/api"
const APP_TOKEN = "8604b867-9238-4083-8b76-a116f3c6b1a2"
const APP_SECRET = "bc9ff7c5-31d9-4d2a-83ad-a71ae68aad2f"

interface GeneratePaymentParams {
  amount: number // in millimes (dinars * 1000)
  bookingId: number | string
  developerTrackingId?: string
  sessionTimeoutSecs?: number
}

export async function generatePaymentLink({
  amount,
  bookingId,
  developerTrackingId = "",
  sessionTimeoutSecs = 1200,
}: GeneratePaymentParams) {
  try {
    // Convert amount to millimes (1 TND = 1000 millimes)
    const amountInMillimes = Math.round(amount * 1000)

    // Create the base URL for success and failure redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const successPath = `/hotels/payment/success?bookingId=${bookingId}`

    const failPath = `/hotels/payment/failed?bookingId=${bookingId}`

    const response = await fetch(`${FLOUCI_API_URL}/generate_payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_token: APP_TOKEN,
        app_secret: APP_SECRET,
        amount: amountInMillimes.toString(),
        accept_card: "true",
        session_timeout_secs: sessionTimeoutSecs,
        success_link: `${baseUrl}${successPath}`,
        fail_link: `${baseUrl}${failPath}`,
        developer_tracking_id:
          developerTrackingId || `${bookingId}`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Flouci API error:", errorData)
      throw new Error(`Failed to generate payment link: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Flouci API response:", data) // Add this for debugging

    if (!data.result?.success) {
      throw new Error("Failed to generate payment link")
    }

    return {
      paymentLink: data.result.link,
      paymentId: data.result.payment_id,
    }
  } catch (error) {
    console.error("Error generating payment link:", error)
    throw error
  }
}

/**
 * Verify payment status using the Flouci API
 * @param paymentId Payment ID to verify
 * @returns Payment verification result
 */
export async function verifyPayment(paymentId: string) {
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
    console.error("Error verifying payment:", error)
    throw error
  }
}

/**
 * Redirect to Flouci payment page
 * @param paymentLink Payment link to redirect to
 */
export async function redirectToPayment(paymentLink: string) {
  redirect(paymentLink)
}

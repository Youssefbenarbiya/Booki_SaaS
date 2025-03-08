"use server"

import { redirect } from "next/navigation"

// Flouci API configuration
const FLOUCI_API_URL = "https://developers.flouci.com/api"
const APP_TOKEN = "8604b867-9238-4083-8b76-a116f3c6b1a2"
const APP_SECRET = "bc9ff7c5-31d9-4d2a-83ad-a71ae68aad2f"

interface GenerateTripPaymentParams {
  amount: number
  bookingId: number | string
  developerTrackingId?: string
  sessionTimeoutSecs?: number
}

export async function generateTripPaymentLink({
  amount,
  bookingId,
  developerTrackingId = "",
  sessionTimeoutSecs = 1200,
}: GenerateTripPaymentParams) {
  try {
    // Convert amount to millimes (1 TND = 1000 millimes)
    const amountInMillimes = Math.round(amount * 1000)

    // Create the base URL for success and failure redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    
    // Debug information
    console.log("Generating trip payment link with:", {
      amount: amountInMillimes,
      amountString: amountInMillimes.toString(),
      bookingId,
      developerTrackingId,
      successLink: `${baseUrl}/trips/payment/success?bookingId=${bookingId}`,
      failLink: `${baseUrl}/trips/payment/failed?bookingId=${bookingId}`,
    })
    
    const requestBody = {
      app_token: APP_TOKEN,
      app_secret: APP_SECRET,
      amount: amountInMillimes.toString(), // Ensure it's a string
      accept_card: "true",
      session_timeout_secs: sessionTimeoutSecs,
      success_link: `${baseUrl}/trips/payment/success?bookingId=${bookingId}`,
      fail_link: `${baseUrl}/trips/payment/failed?bookingId=${bookingId}`,
      developer_tracking_id: developerTrackingId || `trip_${bookingId}`,
    };

    console.log("Request body:", JSON.stringify(requestBody));

    const response = await fetch(`${FLOUCI_API_URL}/generate_payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Raw API error response:", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error("Parsed API error:", errorData);
      } catch (e) {
        console.error("Could not parse error response:", e);
        errorData = { error: errorText };
      }
      
      throw new Error(`Failed to generate payment link: ${response.status} ${response.statusText}`);
    }

    const data = await response.json()
    console.log("Trip payment API response:", data)

    if (!data.result?.success) {
      throw new Error(`Failed to generate trip payment link: ${JSON.stringify(data)}`)
    }

    return {
      paymentLink: data.result.link,
      paymentId: data.result.payment_id,
    }
  } catch (error) {
    console.error("Error generating trip payment link:", error)
    throw error
  }
}

/**
 * Verify payment status using the Flouci API
 * @param paymentId Payment ID to verify
 * @returns Payment verification result
 */
export async function verifyTripPayment(paymentId: string) {
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
    console.error("Error verifying trip payment:", error)
    throw error
  }
}

/**
 * Redirect to Flouci payment page
 * @param paymentLink Payment link to redirect to
 */
export async function redirectToTripPayment(paymentLink: string) {
  redirect(paymentLink)
}

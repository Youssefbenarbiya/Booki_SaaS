"use server"

const FLOUCI_API_URL = "https://developers.flouci.com/api"
const APP_TOKEN = "8604b867-9238-4083-8b76-a116f3c6b1a2"
const APP_SECRET = "bc9ff7c5-31d9-4d2a-83ad-a71ae68aad2f"

export async function generateTripPaymentLink({
  amount,
  bookingId,
}: {
  amount: number
  bookingId: number
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  try {
    // Ensure amount is valid and positive
    if (amount <= 0) {
      throw new Error("Payment amount must be greater than zero")
    }

    // Convert to millimes (integer)
    const amountInMillimes = Math.round(amount * 1000)

    const payload = {
      app_token: APP_TOKEN,
      app_secret: APP_SECRET,
      amount: amountInMillimes,
      accept_card: "true",
      session_timeout_secs: 1200,
      success_link: `${baseUrl}/trips/payment/success?bookingId=${bookingId}`,
      fail_link: `${baseUrl}/trips/payment/failed?bookingId=${bookingId}`,
      developer_tracking_id: `trip_booking_${bookingId}`,
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
      console.error("Payment API error response:", errorText)
      throw new Error(`Payment API error: ${errorText}`)
    }

    const data = await response.json()
    console.log("Payment API response:", data)

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
    console.error("Error verifying payment:", error)
    throw error
  }
}

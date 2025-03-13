import { updateBookingPaymentStatus } from "@/actions/roomBookingActions"
import { generateInvoiceAction } from "@/actions/generateInvoiceAction"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/auth"
import InvoiceDownloadButton from "@/components/InvoiceDownloadButton"

interface PaymentSuccessPageProps {
  searchParams: { bookingId?: string }
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  // Get bookingId safely from searchParams - ensure we parse it properly
  const bookingIdStr = searchParams.bookingId || ""
  const bookingId = bookingIdStr ? parseInt(bookingIdStr, 10) : null

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!bookingId || !session?.user?.id) {
    redirect("/")
  }

  // Update booking payment status first - do this early to ensure payment is recorded
  await updateBookingPaymentStatus(bookingId, "completed", "flouci")

  // Generate invoice path - we'll only generate it once, then provide a link to it
  let invoicePath: string | null = null

  try {
    // Generate the invoice HTML
    invoicePath = await generateInvoiceAction(
      bookingId,
      session.user.name || "Guest",
      session.user.email || ""
    )
  } catch (error) {
    console.error("Failed to generate invoice:", error)
    // Continue without the invoice if generation fails
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your booking has been confirmed and your payment has been processed
          successfully.
        </p>
        <div className="space-y-4">
          {invoicePath && (
            <InvoiceDownloadButton
              invoicePath={invoicePath}
              bookingId={bookingId}
            />
          )}
          <Button asChild className="w-full">
            <Link href={`/user/profile/bookingHistory`}>View My Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

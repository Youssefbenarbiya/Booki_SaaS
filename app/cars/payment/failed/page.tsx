"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CarPaymentFailedPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId") || "Unknown"

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
        <p className="text-xl text-gray-600">
          We couldn't process your car rental payment.
        </p>
      </div>

      <div className="text-center space-y-4 max-w-lg">
        <p className="text-gray-600">
          Please check your payment details and try again. If the problem persists, 
          contact our support team.
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href={`/cars/${bookingId}/booking`}>Try Again</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 
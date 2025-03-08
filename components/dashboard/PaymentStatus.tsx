"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { CheckCircle, XCircle, Clock, CreditCard } from "lucide-react"
import { useState } from "react"

interface PaymentStatusProps {
  status: string
  totalPrice: string | number
  paymentId?: string
  paymentLink?: string
  paymentMethod?: string
  paymentDate?: string
}

export default function PaymentStatus({
  status,
  totalPrice,
  paymentId,
  paymentLink,
  paymentMethod,
  paymentDate,
}: PaymentStatusProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Format payment date if available
  const formattedPaymentDate = paymentDate
    ? new Date(paymentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  // Handle retry payment
  const handleRetryPayment = () => {
    setIsLoading(true)
    if (paymentLink) {
      window.location.href = paymentLink
    } else {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Payment Details</h3>
        <PaymentStatusBadge status={status} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Amount</span>
          <span className="font-medium">
            {typeof totalPrice === "string"
              ? formatPrice(parseFloat(totalPrice))
              : formatPrice(totalPrice)}
          </span>
        </div>

        {paymentMethod && (
          <div className="flex justify-between">
            <span className="text-gray-500">Method</span>
            <span className="font-medium capitalize">{paymentMethod}</span>
          </div>
        )}

        {formattedPaymentDate && (
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-medium">{formattedPaymentDate}</span>
          </div>
        )}

        {paymentId && (
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-medium text-xs truncate max-w-[150px]">
              {paymentId}
            </span>
          </div>
        )}
      </div>

      {status === "failed" && paymentLink && (
        <Button
          onClick={handleRetryPayment}
          className="w-full mt-4 bg-[#FF8A00] hover:bg-[#E67A00]"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Retry Payment"}
        </Button>
      )}

      {status === "pending" && paymentLink && (
        <Button
          onClick={handleRetryPayment}
          className="w-full mt-4 bg-[#FF8A00] hover:bg-[#E67A00]"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Complete Payment"}
        </Button>
      )}
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </Badge>
      )
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      )
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          <CreditCard className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      )
  }
} 
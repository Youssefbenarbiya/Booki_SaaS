"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function MockPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('bookingId')
  const amount = searchParams.get('amount')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!bookingId || !amount) {
      router.push('/not-found')
    }
  }, [bookingId, amount, router])

  const handleSuccessfulPayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      router.push(`/trips/payment/success?bookingId=${bookingId}`)
    }, 1500)
  }

  const handleFailedPayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      router.push(`/trips/payment/failed?bookingId=${bookingId}`)
    }, 1500)
  }

  if (!bookingId || !amount) {
    return null
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <CreditCard className="mr-2" /> Mock Payment System
          </CardTitle>
          <CardDescription className="text-center">
            This is a simulated payment page for development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between">
                <span className="font-medium">Booking ID:</span>
                <span>{bookingId}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Amount:</span>
                <span className="text-lg font-bold">${parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              This is a test payment system. No real transactions will be processed.
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          {isProcessing ? (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSuccessfulPayment} 
                className="w-full" 
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Simulate Successful Payment
              </Button>
              <Button 
                onClick={handleFailedPayment} 
                className="w-full" 
                variant="outline"
              >
                <XCircle className="mr-2 h-4 w-4" /> Simulate Failed Payment
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

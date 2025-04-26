/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function PaymentFailedPage() {
  // Get the locale from the URL params
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Simulate checking payment status or loading any necessary data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">An Error Occurred</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Button
            variant="default"
            className="w-full"
            onClick={() => router.refresh()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="rounded-full bg-gray-200 h-16 w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t process your payment. Please try again or contact
          support if the problem persists.
        </p>

        <div className="flex flex-col space-y-3">
          <Link href={`/${locale}/?type=trips`}>
            <Button variant="default" className="w-full">
              Browse Trips
            </Button>
          </Link>
          <Link href={`/${locale}/contact`}>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface SignInRedirectMessageProps {
  callbackUrl: string
}

export default function SignInRedirectMessage({
  callbackUrl,
}: SignInRedirectMessageProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(callbackUrl)
    },3000) // Redirect after 3 seconds

    return () => clearTimeout(timer)
  }, [router, callbackUrl])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold">
            Sign In Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-center">
            You need to sign in to access this page.
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Redirecting to the sign‑in page shortly...
          </p>
          <div className="flex justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// src/components/GoogleSignIn.tsx

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/auth-client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ErrorContext } from "@better-fetch/fetch"
import { FcGoogle } from "react-icons/fc"

const GoogleSignIn = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [pendingGoogle, setPendingGoogle] = useState(false)

  const handleSignInWithGoogle = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
      },
      {
        onRequest: () => {
          setPendingGoogle(true)
        },
        onSuccess: async () => {
          router.push("/")
          router.refresh()
        },
        onError: (ctx: ErrorContext) => {
          toast({
            title: "Something went wrong",
            description: ctx.error.message ?? "Something went wrong.",
            variant: "destructive",
          })
        },
      }
    )
    setPendingGoogle(false)
  }

  return (
    <Button
      variant="outline"
      className="h-12 border-gray-300 hover:bg-gray-50"
      onClick={handleSignInWithGoogle}
      disabled={pendingGoogle}
    >
      <FcGoogle className="w-5 h-5 mr-2" />
      <span className="mr-2">Google</span>
    </Button>
  )
}

export default GoogleSignIn

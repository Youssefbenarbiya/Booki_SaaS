"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaFacebook } from "react-icons/fa"
import { authClient } from "@/auth-client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import type { ErrorContext } from "@better-fetch/fetch"

export default function FacebookSignIn() {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  const handleSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: "facebook",
      },
      {
        onRequest: () => setPending(true),
        onSuccess: () => {
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
    setPending(false)
  }

  return (
    <Button
      variant="outline"
      className="h-12 border-gray-300 hover:bg-gray-50 w-full"
      onClick={handleSignIn}
      disabled={pending}
    >
      <FaFacebook className="w-5 h-5 mr-2 text-[#1877F2]" />
      Facebook
    </Button>
  )
}

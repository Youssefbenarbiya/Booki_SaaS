"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/auth-client"
import LoadingButton from "@/components/loading-button"
import { useState, ReactNode } from "react"

interface SignoutButtonProps {
  children?: ReactNode
  className?: string
}

export default function SignoutButton({ children, className }: SignoutButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleSignOut = async () => {
    try {
      setPending(true)
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/en/sign-in")
            router.refresh()
          },
        },
      })
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setPending(false)
    }
  }

  return (
    <LoadingButton pending={pending} onClick={handleSignOut} className={className}>
      {children || "Sign Out"}
    </LoadingButton>
  )
}

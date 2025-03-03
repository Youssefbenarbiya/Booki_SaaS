"use client"

import { useRouter } from "next/navigation"

import { authClient } from "@/auth-client"

export default function BookTripButton({ tripId }: { tripId: number }) {
 const session = authClient.useSession() 
   const router = useRouter()

  function handleBooking() {
    if (!session) {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(`/trips/${tripId}/book`))
      return
    }

    router.push(`/trips/${tripId}/book`)
  }

  return (
    <button
      onClick={handleBooking}
      className="btn btn-primary w-full"
    >
      Book This Trip
    </button>
  )
} 
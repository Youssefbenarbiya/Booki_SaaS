"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function BookTripButton({ tripId }: { tripId: number }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

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
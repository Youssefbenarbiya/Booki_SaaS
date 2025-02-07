"use client"

import { deleteHotel } from "@/actions/hotelActions"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

export default function DeleteHotelButton({ hotelId }: { hotelId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (confirm("Are you sure you want to delete this hotel?")) {
      startTransition(async () => {
        await deleteHotel(hotelId)
        router.refresh()
      })
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="btn btn-sm btn-error"
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  )
} 
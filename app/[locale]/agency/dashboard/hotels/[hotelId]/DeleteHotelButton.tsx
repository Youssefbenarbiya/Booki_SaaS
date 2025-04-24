"use client"

import { deleteHotel } from "@/actions/hotels&rooms/hotelActions"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Locale } from "@/i18n/routing"

interface DeleteHotelButtonProps {
  hotelId: string
  locale: Locale
}

export default function DeleteHotelButton({
  hotelId,
  locale,
}: DeleteHotelButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (confirm("Are you sure you want to delete this hotel?")) {
      startTransition(async () => {
        await deleteHotel(hotelId)
        router.push(`/${locale}/agency/dashboard/hotels`)
        router.refresh()
      })
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  )
}

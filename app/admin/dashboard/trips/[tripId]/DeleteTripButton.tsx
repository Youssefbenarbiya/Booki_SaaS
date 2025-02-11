"use client"

import { deleteTrip } from "@/actions/tripActions"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

export default function DeleteTripButton({ tripId }: { tripId: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this trip?")
    if (!confirmed) return

    startTransition(async () => {
      try {
        await deleteTrip(tripId)
        router.push("/admin/dashboard/trips")
        router.refresh()
      } catch (error) {
        console.error("Error deleting trip:", error)
        alert("Failed to delete trip")
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  )
}

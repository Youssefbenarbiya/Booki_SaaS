// app/dashboard/flights/[flightId]/DeleteFlightButton.tsx
"use client"

import { useTransition } from "react"
import { deleteFlight } from "@/actions/flightActions"
import { useRouter } from "next/navigation"

export default function DeleteFlightButton({ flightId }: { flightId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this flight?")
    if (!confirmed) return
    await deleteFlight(flightId)
    router.push("/admin/dashboard/flights")
  }

  return (
    <button
      onClick={() => startTransition(handleDelete)}
      className="btn btn-danger"
    >
      {isPending ? "Deleting..." : "Delete Flight"}
    </button>
  )
}

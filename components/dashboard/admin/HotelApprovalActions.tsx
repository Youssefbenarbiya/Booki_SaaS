"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { approveHotel, rejectHotel } from "@/actions/admin/tripApprovalActions"
import { toast } from "sonner"

export function HotelApprovalActions({ offerId }: { offerId: number }) {
  const [isLoading, setIsLoading] = useState<{
    approve: boolean
    reject: boolean
  }>({
    approve: false,
    reject: false,
  })

  const handleApprove = async () => {
    setIsLoading({ ...isLoading, approve: true })
    try {
      const result = await approveHotel(offerId)
      if (result.success) {
        toast.success("Hotel approved successfully")
        // Refresh the page to reflect changes
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to approve hotel")
      }
    } catch (error) {
      toast.error("An error occurred while approving the hotel")
      console.error(error)
    } finally {
      setIsLoading({ ...isLoading, approve: false })
    }
  }

  const handleReject = async () => {
    setIsLoading({ ...isLoading, reject: true })
    try {
      const result = await rejectHotel(offerId)
      if (result.success) {
        toast.success("Hotel rejected successfully")
        // Refresh the page to reflect changes
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to reject hotel")
      }
    } catch (error) {
      toast.error("An error occurred while rejecting the hotel")
      console.error(error)
    } finally {
      setIsLoading({ ...isLoading, reject: false })
    }
  }

  return (
    <div className="flex space-x-2">
      <Button
        onClick={handleApprove}
        disabled={isLoading.approve || isLoading.reject}
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        {isLoading.approve ? "Approving..." : "Approve"}
      </Button>
      <Button
        onClick={handleReject}
        disabled={isLoading.approve || isLoading.reject}
        variant="destructive"
        size="sm"
      >
        {isLoading.reject ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  )
}

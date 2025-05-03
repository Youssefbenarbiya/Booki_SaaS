"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { approveHotel, rejectHotel } from "@/actions/admin/ApprovalActions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function HotelApprovalActions({ offerId }: { offerId: string | number }) {
  const router = useRouter()
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
      console.log(`Sending approve request for hotel ID: ${offerId}`)
      const result = await approveHotel(offerId)
      
      if (result.success) {
        toast.success("Hotel approved successfully")
        // Use router.refresh instead of window.location.reload for better UX
        router.refresh()
      } else {
        toast.error(result.message || "Failed to approve hotel")
      }
    } catch (error) {
      console.error("Error approving hotel:", error)
      toast.error("An error occurred while approving the hotel")
    } finally {
      setIsLoading({ ...isLoading, approve: false })
    }
  }

  const handleReject = async () => {
    setIsLoading({ ...isLoading, reject: true })
    try {
      console.log(`Sending reject request for hotel ID: ${offerId}`)
      const result = await rejectHotel(offerId)
      
      if (result.success) {
        toast.success("Hotel rejected successfully")
        // Use router.refresh instead of window.location.reload for better UX
        router.refresh()
      } else {
        toast.error(result.message || "Failed to reject hotel")
      }
    } catch (error) {
      console.error("Error rejecting hotel:", error)
      toast.error("An error occurred while rejecting the hotel")
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

"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { approveCar, rejectCar } from "@/actions/admin/ApprovalActions"
import { toast } from "sonner"

export function CarApprovalActions({ offerId }: { offerId: number }) {
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
      const result = await approveCar(offerId)
      if (result.success) {
        toast.success("Car approved successfully")
        // Refresh the page to reflect changes
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to approve car")
      }
    } catch (error) {
      toast.error("An error occurred while approving the car")
      console.error(error)
    } finally {
      setIsLoading({ ...isLoading, approve: false })
    }
  }

  const handleReject = async () => {
    setIsLoading({ ...isLoading, reject: true })
    try {
      const result = await rejectCar(offerId)
      if (result.success) {
        toast.success("Car rejected successfully")
        // Refresh the page to reflect changes
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to reject car")
      }
    } catch (error) {
      toast.error("An error occurred while rejecting the car")
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

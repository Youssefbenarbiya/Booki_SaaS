"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { sendTripStatusNotification } from "@/actions/admin/notificationActions"
import { toast } from "@/hooks/use-toast"

interface TripApprovalActionsProps {
  tripId: number
}

export function TripApprovalActions({ tripId }: TripApprovalActionsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleStatusChange = async (status: "approved" | "rejected") => {
    setIsLoading(true)
    try {
      // First update the trip status in the database
      const updateResponse = await fetch(
        `/api/admin/trips/${tripId}/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.message || "Failed to update trip status")
      }

      const updateData = await updateResponse.json()
      console.log("Trip status updated:", updateData)

      // Send notification to agency
      const result = await sendTripStatusNotification(tripId, status)

      if (!result.success) {
        console.warn("Notification could not be sent:", result.message)
        // Continue anyway since the primary action (status update) succeeded
      }

      // Success message
      if (typeof toast === "function") {
        toast({
          title: `Trip ${
            status === "approved" ? "approved" : "rejected"
          } successfully`,
          description: result.success
            ? "Notification sent to agency."
            : "Trip status updated but notification couldn't be sent.",
          variant: "default",
        })
      } else {
        alert(`Trip ${status} successfully!`)
      }

      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error(
        `Error ${status === "approved" ? "approving" : "rejecting"} trip:`,
        error
      )

      if (typeof toast === "function") {
        toast({
          title: "Error",
          description: `Failed to ${status} trip. Please try again.`,
          variant: "destructive",
        })
      } else {
        alert(
          `Error ${
            status === "approved" ? "approving" : "rejecting"
          } trip. Please try again.`
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => handleStatusChange("approved")}
        className="bg-green-600 hover:bg-green-700"
        disabled={isLoading}
        size="sm"
      >
        Approve
      </Button>
      <Button
        onClick={() => handleStatusChange("rejected")}
        variant="destructive"
        disabled={isLoading}
        size="sm"
      >
        Reject
      </Button>
    </div>
  )
}

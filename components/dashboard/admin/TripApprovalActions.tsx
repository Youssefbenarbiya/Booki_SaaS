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
      console.log(`Starting status change to ${status} for trip ${tripId}`)

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

      const updateData = await updateResponse.json()
      console.log("Update response:", updateData)

      if (!updateResponse.ok) {
        throw new Error(updateData.message || "Failed to update trip status")
      }

      // Wait a moment to ensure DB transaction completes
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Send notification to agency
      console.log(`Sending notification for trip ${tripId}`)
      const notificationResult = await sendTripStatusNotification(
        tripId,
        status
      )
      console.log(`Notification result:`, notificationResult)

      if (notificationResult.success) {
        console.log("Notification sent successfully")
        if (typeof toast === "function") {
          toast({
            title: `Trip ${
              status === "approved" ? "approved" : "rejected"
            } successfully`,
            description: "Notification sent to agency.",
            variant: "default",
          })
        } else {
          alert(`Trip ${status} successfully! Notification sent.`)
        }
      } else {
        console.warn(
          "Notification could not be sent:",
          notificationResult.message
        )
        if (typeof toast === "function") {
          toast({
            title: `Trip ${
              status === "approved" ? "approved" : "rejected"
            } successfully`,
            description:
              "Trip status updated but notification couldn't be sent.",
            variant: "default",
          })
        } else {
          alert(`Trip ${status} successfully! (Notification failed)`)
        }
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

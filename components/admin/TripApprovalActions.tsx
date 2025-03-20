/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface TripApprovalActionsProps {
  tripId: number
}

export function TripApprovalActions({ tripId }: TripApprovalActionsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      const response = await fetch(`/api/admin/trips/${tripId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Trip has been approved",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to approve trip",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsRejecting(true)
      const response = await fetch(`/api/admin/trips/${tripId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Trip has been rejected",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reject trip",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="space-x-2">
      <Button
        size="sm"
        className="bg-green-500 hover:bg-green-600"
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
      >
        <CheckIcon className="h-4 w-4 mr-1" />
        {isApproving ? "Processing..." : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleReject}
        disabled={isApproving || isRejecting}
      >
        <XIcon className="h-4 w-4 mr-1" />
        {isRejecting ? "Processing..." : "Reject"}
      </Button>
    </div>
  )
}

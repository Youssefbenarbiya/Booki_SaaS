"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { approveTrip, rejectTrip } from "@/actions/admin/ApprovalActions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function TripApprovalActions({ offerId }: { offerId: number }) {
  const [isLoading, setIsLoading] = useState<{
    approve: boolean
    reject: boolean
  }>({
    approve: false,
    reject: false,
  })
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprove = async () => {
    setIsLoading({ ...isLoading, approve: true })
    try {
      const result = await approveTrip(offerId)
      if (result.success) {
        toast.success("Trip approved successfully")
        // Refresh the page to reflect changes
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to approve trip")
      }
    } catch (error) {
      toast.error("An error occurred while approving the trip")
      console.error(error)
    } finally {
      setIsLoading({ ...isLoading, approve: false })
    }
  }

  const openRejectionDialog = () => {
    setRejectionDialogOpen(true)
  }

  const handleReject = async () => {
    setIsLoading({ ...isLoading, reject: true })
    try {
      const result = await rejectTrip(offerId, rejectionReason)
      if (result.success) {
        toast.success("Trip rejected successfully")
        // Refresh the page to reflect changes
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to reject trip")
      }
    } catch (error) {
      toast.error("An error occurred while rejecting the trip")
      console.error(error)
    } finally {
      setIsLoading({ ...isLoading, reject: false })
      setRejectionDialogOpen(false)
    }
  }

  return (
    <>
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
          onClick={openRejectionDialog}
          disabled={isLoading.approve || isLoading.reject}
          variant="destructive"
          size="sm"
        >
          {isLoading.reject ? "Rejecting..." : "Reject"}
        </Button>
      </div>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Trip</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this trip. This will be sent to the agency.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectionDialogOpen(false)}
              disabled={isLoading.reject}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isLoading.reject}
            >
              {isLoading.reject ? "Rejecting..." : "Reject Trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

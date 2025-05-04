"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { approveHotel, rejectHotel } from "@/actions/admin/ApprovalActions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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

export function HotelApprovalActions({ offerId }: { offerId: string | number }) {
  const router = useRouter()
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

  const openRejectionDialog = () => {
    setRejectionDialogOpen(true)
  }

  const handleReject = async () => {
    setIsLoading({ ...isLoading, reject: true })
    try {
      console.log(`Sending reject request for hotel ID: ${offerId} with reason: ${rejectionReason}`)
      const result = await rejectHotel(offerId, rejectionReason)
      
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
            <DialogTitle>Reject Hotel</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this hotel. This will be sent to the agency.
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
              {isLoading.reject ? "Rejecting..." : "Reject Hotel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

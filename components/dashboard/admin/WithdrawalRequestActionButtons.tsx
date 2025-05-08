"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { approveWithdrawalRequest, rejectWithdrawalRequest } from "@/actions/admin/withdrawalActions"

interface WithdrawalRequestActionButtonsProps {
  requestId: number
}

export function WithdrawalRequestActionButtons({
  requestId,
}: WithdrawalRequestActionButtonsProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async () => {
    try {
      setIsSubmitting(true)
      const result = await approveWithdrawalRequest({
        requestId,
        notes,
      })

      if (result.success) {
        toast.success("Withdrawal request approved successfully")
        setIsApproveDialogOpen(false)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to approve withdrawal request")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsSubmitting(true)
      const result = await rejectWithdrawalRequest({
        requestId,
        notes,
      })

      if (result.success) {
        toast.success("Withdrawal request rejected successfully")
        setIsRejectDialogOpen(false)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to reject withdrawal request")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={() => setIsApproveDialogOpen(true)}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsRejectDialogOpen(true)}
      >
        Reject
      </Button>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal Request</DialogTitle>
            <DialogDescription>
              Confirm that you have sent the payment to the agency's bank account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add optional notes about the transaction (reference number, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={isSubmitting || !notes.trim()}
            >
              {isSubmitting ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
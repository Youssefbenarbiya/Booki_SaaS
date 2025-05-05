"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { approveBlog, rejectBlog } from "@/actions/admin/ApprovalActions"
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

type BlogApprovalActionsProps = {
  blogId?: number
  offerId?: number
}

export function BlogApprovalActions({
  blogId,
  offerId,
}: BlogApprovalActionsProps) {
  // Use either blogId or offerId, with blogId taking precedence if both are provided
  const id = blogId ?? offerId

  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const router = useRouter()

  if (!id) {
    console.error(
      "BlogApprovalActions: No ID provided (neither blogId nor offerId)"
    )
    return null
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      const response = await approveBlog(id)

      if (response.success) {
        toast.success(response.message)
        router.refresh()
      } else {
        toast.error(response.message || "Failed to approve blog")
      }
    } catch (error) {
      console.error("Error approving blog:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsApproving(false)
    }
  }

  const openRejectionDialog = () => {
    setRejectionDialogOpen(true)
  }

  const handleReject = async () => {
    try {
      setIsRejecting(true)
      const response = await rejectBlog(id, rejectionReason)

      if (response.success) {
        toast.success(response.message)
        router.refresh()
      } else {
        toast.error(response.message || "Failed to reject blog")
      }
    } catch (error) {
      console.error("Error rejecting blog:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsRejecting(false)
      setRejectionDialogOpen(false)
    }
  }

  return (
    <>
      <div className="flex space-x-2">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
        >
          {isApproving ? "Approving..." : "Approve"}
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={openRejectionDialog}
          disabled={isApproving || isRejecting}
        >
          {isRejecting ? "Rejecting..." : "Reject"}
        </Button>
      </div>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Blog</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this blog post. This will be sent to the author.
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
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? "Rejecting..." : "Reject Blog"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

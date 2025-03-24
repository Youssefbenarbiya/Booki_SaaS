"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { approveBlog, rejectBlog } from "@/actions/admin/ApprovalActions"

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

  const handleReject = async () => {
    try {
      setIsRejecting(true)
      const response = await rejectBlog(id)

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
    }
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant="default"
        size="sm"
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
      >
        {isApproving ? "Approving..." : "Approve"}
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleReject}
        disabled={isApproving || isRejecting}
      >
        {isRejecting ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  )
}

"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { eq, desc, asc, sql } from "drizzle-orm"
import { withdrawalRequest, agencyWallet, walletTransaction, agencies, notifications } from "@/db/schema"
import { db } from "@/db"

/**
 * Get all withdrawal requests for admin
 */
export async function getWithdrawalRequests() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { withdrawalRequests: [], error: "Unauthorized" }
    }

    // Get all withdrawal requests with agency details
    const withdrawalRequests = await db.query.withdrawalRequest.findMany({
      with: {
        agency: {
          columns: {
            userId: true,
            agencyName: true,
            contactEmail: true,
          }
        }
      },
      orderBy: [
        // Pending first, then by creation date desc
        asc(withdrawalRequest.status),
        desc(withdrawalRequest.createdAt)
      ],
    })

    return { withdrawalRequests }
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error)
    return { withdrawalRequests: [], error: "Failed to fetch withdrawal requests" }
  }
}

/**
 * Approve a withdrawal request
 */
export async function approveWithdrawalRequest({
  requestId,
  notes,
}: {
  requestId: number
  notes?: string
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Get the withdrawal request with agency details
    const [withdrawalRequestData] = await db.query.withdrawalRequest.findMany({
      where: eq(withdrawalRequest.id, requestId),
      with: {
        agency: {
          columns: {
            userId: true,
            agencyName: true,
          }
        }
      },
      limit: 1
    })

    if (!withdrawalRequestData) {
      return { success: false, error: "Withdrawal request not found" }
    }

    if (withdrawalRequestData.status !== "pending") {
      return { success: false, error: "Withdrawal request is already processed" }
    }

    // Get agency wallet
    const [agencyWalletData] = await db.query.agencyWallet.findMany({
      where: eq(agencyWallet.agencyId, withdrawalRequestData.agencyId),
      limit: 1
    })

    if (!agencyWalletData) {
      return { success: false, error: "Agency wallet not found" }
    }

    const walletBalance = parseFloat(agencyWalletData.balance || "0")
    const withdrawalAmount = parseFloat(withdrawalRequestData.amount || "0")
    
    if (walletBalance < withdrawalAmount) {
      return { success: false, error: "Insufficient balance in agency wallet" }
    }

    // Update wallet balance - decrement by withdrawal amount
    await db.update(agencyWallet)
      .set({
        balance: sql`${agencyWallet.balance} - ${withdrawalRequestData.amount}`,
        updatedAt: new Date()
      })
      .where(eq(agencyWallet.agencyId, withdrawalRequestData.agencyId))

    // Record transaction
    await db.insert(walletTransaction).values({
      agencyId: withdrawalRequestData.agencyId,
      amount: withdrawalRequestData.amount,
      type: "debit",
      description: `Withdrawal to ${withdrawalRequestData.bankName} account ${withdrawalRequestData.bankAccountNumber}`,
      status: "completed",
      withdrawalRequestId: withdrawalRequestData.id,
    })

    // Update withdrawal request
    await db.update(withdrawalRequest)
      .set({
        status: "approved",
        processedAt: new Date(),
        processedById: session.user.id,
        adminNotes: notes || null,
        updatedAt: new Date()
      })
      .where(eq(withdrawalRequest.id, requestId))

    // Create notification for agency
    await db.insert(notifications).values({
      title: "Withdrawal Request Approved",
      message: `Your withdrawal request for $${parseFloat(withdrawalRequestData.amount).toFixed(2)} has been approved and processed.`,
      type: "success",
      userId: withdrawalRequestData.agency.userId,
      relatedItemType: "withdrawal",
      relatedItemId: withdrawalRequestData.id,
    })

    revalidatePath("/admin/withdrawals")
    revalidatePath("/agency/dashboard/wallet")
    
    return { success: true }
  } catch (error) {
    console.error("Error approving withdrawal request:", error)
    return { success: false, error: "Failed to approve withdrawal request" }
  }
}

/**
 * Reject a withdrawal request
 */
export async function rejectWithdrawalRequest({
  requestId,
  notes,
}: {
  requestId: number
  notes: string
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Get the withdrawal request with agency details
    const [withdrawalRequestData] = await db.query.withdrawalRequest.findMany({
      where: eq(withdrawalRequest.id, requestId),
      with: {
        agency: {
          columns: {
            userId: true,
            agencyName: true,
          }
        }
      },
      limit: 1
    })

    if (!withdrawalRequestData) {
      return { success: false, error: "Withdrawal request not found" }
    }

    if (withdrawalRequestData.status !== "pending") {
      return { success: false, error: "Withdrawal request is already processed" }
    }

    // Update withdrawal request
    await db.update(withdrawalRequest)
      .set({
        status: "rejected",
        processedAt: new Date(),
        processedById: session.user.id,
        adminNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(withdrawalRequest.id, requestId))

    // Create notification for agency
    await db.insert(notifications).values({
      title: "Withdrawal Request Rejected",
      message: `Your withdrawal request for $${parseFloat(withdrawalRequestData.amount).toFixed(2)} has been rejected. Reason: ${notes}`,
      type: "error",
      userId: withdrawalRequestData.agency.userId,
      relatedItemType: "withdrawal",
      relatedItemId: withdrawalRequestData.id,
    })

    revalidatePath("/admin/withdrawals")
    revalidatePath("/agency/dashboard/wallet")
    
    return { success: true }
  } catch (error) {
    console.error("Error rejecting withdrawal request:", error)
    return { success: false, error: "Failed to reject withdrawal request" }
  }
} 
import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"
import { wallet, walletTransactions, withdrawalRequests } from "@/db/schema"
import { auth } from "@/auth"
import { headers } from "next/headers"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id } = await params 

    const userId = session.user.id
    const withdrawalId = Number.parseInt(id)
    const body = await request.json()
    const { status, rejectionReason, receiptUrl } = body

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get withdrawal request
    const withdrawalRequest = await db.query.withdrawalRequests.findFirst({
      where: eq(withdrawalRequests.id, withdrawalId),
    })

    if (!withdrawalRequest) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      )
    }

    // Check if request is already processed
    if (withdrawalRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Withdrawal request already processed" },
        { status: 400 }
      )
    }

    // Get user's wallet
    const userWallet = await db.query.wallet.findFirst({
      where: eq(wallet.id, withdrawalRequest.walletId),
    })

    if (!userWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Process based on status
    if (status === "approved") {
      // Ensure receipt URL is provided for approval
      if (!receiptUrl) {
        return NextResponse.json(
          { error: "Receipt URL is required for approval" },
          { status: 400 }
        )
      }

      // Update wallet balance
      const newBalance =
        Number.parseFloat(userWallet.balance.toString()) -
        Number.parseFloat(withdrawalRequest.amount.toString())

      if (newBalance < 0) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        )
      }

      // Update wallet
      await db
        .update(wallet)
        .set({
          balance: newBalance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(wallet.id, userWallet.id))

      // Create transaction record
      await db.insert(walletTransactions).values({
        walletId: userWallet.id,
        amount: withdrawalRequest.amount.toString(),
        type: "withdrawal",
        status: "completed",
        description: "Withdrawal request approved",
        reference: withdrawalRequest.id.toString(),
        referenceType: "withdrawal_request",
      })

      // Update withdrawal request
      await db
        .update(withdrawalRequests)
        .set({
          status: "approved",
          approvedBy: userId,
          approvedAt: new Date(),
          receiptUrl: receiptUrl,
          updatedAt: new Date(),
        })
        .where(eq(withdrawalRequests.id, withdrawalId))
    } else {
      // Reject withdrawal request
      await db
        .update(withdrawalRequests)
        .set({
          status: "rejected",
          rejectedBy: userId,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || "Rejected by admin",
          updatedAt: new Date(),
        })
        .where(eq(withdrawalRequests.id, withdrawalId))
    }

    return NextResponse.json({
      message: `Withdrawal request ${status} successfully`,
    })
  } catch (error) {
    console.error("Error updating withdrawal request:", error)
    return NextResponse.json(
      { error: "Failed to update withdrawal request" },
      { status: 500 }
    )
  }
}

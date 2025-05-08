"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { auth } from "@/auth"
import { eq, desc } from "drizzle-orm"
import { agencies, agency ownerWallet, walletTransaction, withdrawalRequest, notifications } from "@/db/schema"

/**
 * Get agency owner wallet
 */
export async function getagency ownerWallet() {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "agency owner") {
      return { wallet: null, error: "Unauthorized" }
    }

    // Get the agency owner id from the user
    const agency owner = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
      columns: { userId: true },
    })

    if (!agency owner) {
      return { wallet: null, error: "agency owner not found" }
    }

    // Get or create wallet for the agency owner
    let wallet = await db.query.agency ownerWallet.findFirst({
      where: eq(agency ownerWallet.agency ownerId, agency owner.userId),
    })

    // If wallet doesn't exist, create it
    if (!wallet) {
      const [newWallet] = await db.insert(agency ownerWallet).values({
        agency ownerId: agency owner.userId,
        balance: 0,
      }).returning()
      
      wallet = newWallet
    }

    return { wallet }
  } catch (error) {
    console.error("Error fetching agency owner wallet:", error)
    return { wallet: null, error: "Failed to fetch wallet" }
  }
}

/**
 * Get agency owner transactions
 */
export async function getagency ownerTransactions(limit = 10) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "agency owner") {
      return { transactions: [], error: "Unauthorized" }
    }

    // Get the agency owner id from the user
    const agency owner = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
      columns: { userId: true },
    })

    if (!agency owner) {
      return { transactions: [], error: "agency owner not found" }
    }

    // Get transactions for the agency owner
    const transactions = await db.query.walletTransaction.findMany({
      where: eq(walletTransaction.agency ownerId, agency owner.userId),
      orderBy: [desc(walletTransaction.createdAt)],
      limit: limit,
    })

    return { transactions }
  } catch (error) {
    console.error("Error fetching agency owner transactions:", error)
    return { transactions: [], error: "Failed to fetch transactions" }
  }
}

/**
 * Get agency owner withdrawal requests
 */
export async function getagency ownerWithdrawalRequests() {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "agency owner") {
      return { withdrawalRequests: [], error: "Unauthorized" }
    }

    // Get the agency owner id from the user
    const agency owner = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
      columns: { userId: true },
    })

    if (!agency owner) {
      return { withdrawalRequests: [], error: "agency owner not found" }
    }

    // Get withdrawal requests for the agency owner
    const withdrawalRequests = await db.query.withdrawalRequest.findMany({
      where: eq(withdrawalRequest.agency ownerId, agency owner.userId),
      orderBy: [desc(withdrawalRequest.createdAt)],
    })

    return { withdrawalRequests }
  } catch (error) {
    console.error("Error fetching agency owner withdrawal requests:", error)
    return { withdrawalRequests: [], error: "Failed to fetch withdrawal requests" }
  }
}

/**
 * Create a withdrawal request
 */
export async function createWithdrawalRequest(data: {
  amount: number
  bankName: string
  accountHolderName: string
  bankAccountNumber: string
  notes?: string
}) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "agency owner") {
      return { success: false, error: "Unauthorized" }
    }

    // Get the agency owner
    const agency owner = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
      columns: { userId: true, agency ownerName: true },
    })

    if (!agency owner) {
      return { success: false, error: "agency owner not found" }
    }

    // Get wallet and check balance
    const wallet = await db.query.agency ownerWallet.findFirst({
      where: eq(agency ownerWallet.agency ownerId, agency owner.userId),
    })

    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }

    if (wallet.balance < data.amount) {
      return { success: false, error: "Insufficient balance" }
    }

    // Create withdrawal request
    const [newWithdrawalRequest] = await db.insert(withdrawalRequest).values({
      agency ownerId: agency owner.userId,
      amount: data.amount,
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      bankAccountNumber: data.bankAccountNumber,
      notes: data.notes || null,
      status: "pending",
    }).returning()

    // Create notification for admin
    await db.insert(notifications).values({
      title: "New Withdrawal Request",
      message: `${agency owner.agency ownerName} has requested a withdrawal of $${data.amount.toFixed(2)}`,
      type: "info",
      role: "ADMIN",
      relatedItemType: "withdrawal",
      relatedItemId: newWithdrawalRequest.id,
    })

    revalidatePath("/agency owner/dashboard/wallet")
    return { success: true, withdrawalRequest: newWithdrawalRequest }
  } catch (error) {
    console.error("Error creating withdrawal request:", error)
    return { success: false, error: "Failed to create withdrawal request" }
  }
} 
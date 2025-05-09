import { type NextRequest, NextResponse } from "next/server"
import { wallet, withdrawalRequests } from "@/db/schema"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"

// Create a withdrawal request
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, paymentMethod, paymentDetails } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Find user's wallet
    const userWallet = await db.query.wallet.findFirst({
      where: eq(wallet.userId, userId),
    })

    if (!userWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Check if user has enough balance
    if (Number.parseFloat(userWallet.balance.toString()) < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const newRequest = await db
      .insert(withdrawalRequests)
      .values({
        walletId: userWallet.id,
        userId,
        amount: amount.toString(),
        status: "pending",
        paymentMethod: paymentMethod || "bank_transfer",
        paymentDetails: paymentDetails || "",
      })
      .returning()

    return NextResponse.json({
      message: "Withdrawal request created successfully",
      request: newRequest[0],
    })
  } catch (error) {
    console.error("Error creating withdrawal request:", error)
    return NextResponse.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 }
    )
  }
}

// Get withdrawal requests for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get withdrawal requests
    const requests = await db.query.withdrawalRequests.findMany({
      where: eq(withdrawalRequests.userId, userId),
      orderBy: [db.desc(withdrawalRequests.createdAt)],
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch withdrawal requests" },
      { status: 500 }
    )
  }
}

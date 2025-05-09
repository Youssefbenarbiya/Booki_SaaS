import { type NextRequest, NextResponse } from "next/server"
import { wallet } from "@/db/schema"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"

// Get wallet for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find or create wallet
    let userWallet = await db.query.wallet.findFirst({
      where: eq(wallet.userId, userId),
    })

    if (!userWallet) {
      // Create a new wallet if it doesn't exist
      const newWallet = await db
        .insert(wallet)
        .values({
          userId,
          balance: "0",
          currency: "TND",
          isActive: true,
        })
        .returning()

      userWallet = newWallet[0]
    }

    return NextResponse.json({ wallet: userWallet })
  } catch (error) {
    console.error("Error fetching wallet:", error)
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    )
  }
}

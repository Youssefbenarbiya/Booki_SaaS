import { type NextRequest, NextResponse } from "next/server"
import { wallet } from "@/db/schema"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Get wallet for a user
export async function GET(request: NextRequest) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      console.log("No user ID in session:", session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("Getting wallet for user ID:", userId)

    try {
      // Find or create wallet
      let userWallet = await db.query.wallet.findFirst({
        where: eq(wallet.userId, userId),
      })
      
      console.log("Found wallet:", userWallet)

      if (!userWallet) {
        console.log("No wallet found, creating one")
        // Create a new wallet if it doesn't exist
        try {
          // The schema has defaultNow() for timestamps and default values for other fields
          // Just provide the required userId
          const newWallet = await db
            .insert(wallet)
            .values({
              userId: userId,
            })
            .returning()
            
          console.log("Created new wallet:", newWallet)
          userWallet = newWallet[0]
        } catch (insertError) {
          console.error("Error creating wallet:", insertError)
          return NextResponse.json(
            { 
              error: "Failed to create wallet", 
              details: getErrorMessage(insertError)
            },
            { status: 500 }
          )
        }
      }

      return NextResponse.json({ wallet: userWallet })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { 
          error: "Database error", 
          details: getErrorMessage(dbError)
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in wallet API:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch wallet", 
        details: getErrorMessage(error)
      },
      { status: 500 }
    )
  }
}

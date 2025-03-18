import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { favorites } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ isFavorite: false })
  }

  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get("itemId")
  const itemType = searchParams.get("itemType")

  if (!itemId || !itemType) {
    return NextResponse.json(
      { message: "Missing required parameters" },
      { status: 400 }
    )
  }

  try {
    const favorite = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, session.user.id),
        eq(favorites.itemType, itemType),
        eq(favorites.itemId, itemId.toString())
      ),
    })

    return NextResponse.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error("Error checking favorite status:", error)
    return NextResponse.json(
      { message: "Failed to check favorite status" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { favorites } from "@/db/schema"
import { and, eq } from "drizzle-orm"

// Toggle favorite status
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { itemId, itemType } = await request.json()

    if (!itemId || !itemType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if the item is already favorited
    const existingFavorite = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, session.user.id),
        eq(favorites.itemType, itemType),
        eq(favorites.itemId, itemId.toString())
      ),
    })

    if (existingFavorite) {
      // Remove from favorites
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, session.user.id),
            eq(favorites.itemType, itemType),
            eq(favorites.itemId, itemId.toString())
          )
        )
      return NextResponse.json({ isFavorite: false })
    } else {
      // Add to favorites
      await db.insert(favorites).values({
        userId: session.user.id,
        itemType,
        itemId: itemId.toString(),
      })
      return NextResponse.json({ isFavorite: true })
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json(
      { message: "Failed to update favorite" },
      { status: 500 }
    )
  }
}

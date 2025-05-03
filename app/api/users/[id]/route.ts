import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import db from "@/db/drizzle"
import { user as userTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify that the requestor is authenticated
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const userData = await db.query.user.findFirst({
      where: eq(userTable.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        image: true,
      },
    })

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
} 
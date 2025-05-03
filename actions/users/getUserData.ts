import db from "@/db/drizzle"
import { user as userTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export interface UserData {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  address: string | null
  image: string | null
}

export async function getUserData(userId: string): Promise<{
  success: boolean
  data?: UserData
  error?: string
}> {
  try {
    // Add input validation first
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("Invalid userId provided:", userId)
      return {
        success: false,
        error: "Invalid userId provided",
      }
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
      console.error(`User not found for userId: ${userId}`)
      return {
        success: false,
        error: "User not found",
      }
    }
    console.log(`Successfully fetched user data for: ${userData.name}`)
    return {
      success: true,
      data: userData,
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}

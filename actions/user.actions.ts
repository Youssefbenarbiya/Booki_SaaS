import { auth } from "@/auth"
import db from "@/db/drizzle"
import { headers } from "next/headers"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
export async function getUserById(userId: string) {
  const user = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
  })
  if (!user) throw new Error("User not found")
  return user
}
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    const currentUser = await db.query.user.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      where: (user, { eq }) => eq(user.id, session?.user.id!),
    })
    if (!currentUser) throw new Error("User not found")
    await db
      .update(user)
      .set({
        name: user.name,
      })
      .where(eq(user.id, currentUser.id))
    return {
      success: true,
      message: "User updated successfully",
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

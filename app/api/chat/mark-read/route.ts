import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { chatMessages } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Verify that the requestor is authenticated
    const session = await auth.api.getSession({ request });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, postType, receiverId } = await request.json();

    // Validate required fields
    if (!postId || !postType || !receiverId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mark messages as read
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.postId, postId),
          eq(chatMessages.postType, postType),
          eq(chatMessages.receiverId, receiverId),
          eq(chatMessages.isRead, false)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}

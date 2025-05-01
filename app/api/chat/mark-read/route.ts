import { markMessagesAsRead } from "@/actions/chat/chatActions";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await auth.api.getSession();

    // Check if user is authenticated
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { postId, postType, receiverId } = await request.json();

    // Validate required fields
    if (!postId || !postType) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use the userId from session by default, or the provided receiverId
    const userId = receiverId || session.user.id;

    // Mark messages as read
    const result = await markMessagesAsRead(postId, postType, userId);

    if (result.success) {
      return Response.json({ success: true }, { status: 200 });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return Response.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}

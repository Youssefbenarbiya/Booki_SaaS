import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";

export async function POST(request: Request) {
  try {
    // Extract session from request
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();

    // Get the user's ID from the session
    const userId = session.user.id;

    // Check if the user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare the update data
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Add the fields from the request body that are allowed to be updated
    const allowedFields = [
      "name",
      "phoneNumber",
      "address",
      "image",
      "country",
      "region",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field === "phoneNumber" ? "phone_number" : field] =
          body[field];
      }
    }

    // Update the user in the database
    await db.update(user).set(updateData).where(eq(user.id, userId));

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

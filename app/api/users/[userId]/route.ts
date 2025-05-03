import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Extract session from request
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;

    // Security check: Only allow users to fetch their own profile
    // or admins to fetch any profile
    if (session.user.id !== userId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user from the database
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return a sanitized user object (omit sensitive info)
    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      image: userData.image,
      country: userData.country,
      region: userData.region,
      emailVerified: userData.emailVerified,
      role: userData.role,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
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

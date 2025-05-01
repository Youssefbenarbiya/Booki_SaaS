"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  image: string | null;
}

export async function getUserData(userId: string): Promise<{
  success: boolean;
  data?: UserData;
  error?: string;
}> {
  try {
    // Add input validation first
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("Invalid userId provided:", userId);
      return {
        success: false,
        error: "Invalid userId provided",
      };
    }

    let session;
    try {
      // Try to get the session, but don't fail if it's not available
      session = await auth.api.getSession({
        headers: headers(),
      });
    } catch (sessionError) {
      console.warn(
        "Session retrieval failed, proceeding without authentication check:",
        sessionError
      );
      // Continue without session - we'll use a more limited data set
    }

    // Fetch user data
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
    });

    if (!userData) {
      console.error(`User not found for userId: ${userId}`);
      return {
        success: false,
        error: "User not found",
      };
    }

    // If no session or not authenticated, return limited data
    if (!session?.user) {
      console.log(
        `Returning limited user data for: ${userData.name} (no auth)`
      );
      return {
        success: true,
        data: {
          id: userData.id,
          name: userData.name,
          email: "****@****.***", // Masked for privacy
          phoneNumber: null,
          address: null,
          image: userData.image,
        },
      };
    }

    console.log(`Successfully fetched user data for: ${userData.name}`);
    return {
      success: true,
      data: userData,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

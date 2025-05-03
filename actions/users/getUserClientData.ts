"use server"

// This server action is safe to import from client components
export interface UserData {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  address: string | null
  image: string | null
}

export async function getUserClientData(userId: string): Promise<{
  success: boolean
  data?: UserData
  error?: string
}> {
  try {
    // Input validation
    if (!userId || userId === "undefined" || userId === "null") {
      return {
        success: false,
        error: "Invalid userId provided",
      }
    }

    // Fetch from API endpoint instead of direct DB access
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error fetching user data: ${response.status}`);
    }

    const userData = await response.json();
    
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
import { NextResponse } from "next/server";
import { testAdminNotificationEmail } from "@/actions/admin/adminNotifications";

// Simple API endpoint to test admin email notifications
export async function GET() {
  try {
    const result = await testAdminNotificationEmail();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Test email sent successfully", 
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message || "Failed to send test email" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in test-email API route:", error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

export async function POST(request: NextRequest) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse form data (multipart/form-data)
    const formData = await request.formData()
    const receiptFile = formData.get("receipt") as File | null
    const withdrawalId = formData.get("withdrawalId") as string | null

    // Validate input
    if (!receiptFile) {
      return NextResponse.json(
        { error: "Receipt file is required" },
        { status: 400 }
      )
    }

    if (!withdrawalId) {
      return NextResponse.json(
        { error: "Withdrawal ID is required" },
        { status: 400 }
      )
    }

    // Validate file size
    if (receiptFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(receiptFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type (only JPG/PNG/WEBP/PDF allowed)" },
        { status: 400 }
      )
    }

    // Read the file as a buffer
    const buffer = Buffer.from(await receiptFile.arrayBuffer())
    const filename = `withdrawal_receipt_${withdrawalId}_${Date.now()}_${receiptFile.name.replace(/\s/g, "_")}`

    // Convert buffer to a data URI string
    const dataUri = `data:${receiptFile.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "withdrawal-receipts",
      public_id: filename,
      resource_type: receiptFile.type === "application/pdf" ? "raw" : "image",
    })

    // Return the URL to the uploaded receipt
    return NextResponse.json({
      message: "Receipt uploaded successfully",
      receiptUrl: result.secure_url,
    })
  } catch (error) {
    console.error("Error uploading receipt:", error)
    return NextResponse.json(
      { error: "Failed to upload receipt" },
      { status: 500 }
    )
  }
} 
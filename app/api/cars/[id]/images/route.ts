import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary"; // Assuming you have a cloudinary setup

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const carId = parseInt(params.id, 10);
    if (isNaN(carId)) {
      return new NextResponse("Invalid car ID", { status: 400 });
    }

    // Check if car exists
    const car = await db.car.findUnique({
      where: { id: carId }
    });

    if (!car) {
      return new NextResponse("Car not found", { status: 404 });
    }

    // Process form data
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return new NextResponse("No images provided", { status: 400 });
    }

    // Upload images to cloudinary and save to database
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Upload to cloudinary
      const result = await uploadToCloudinary(buffer);
      
      // Save to database
      return db.carImage.create({
        data: {
          carId,
          url: result.secure_url,
          publicId: result.public_id,
        }
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    
    return NextResponse.json(uploadedImages);
  } catch (error) {
    console.error("[CAR_IMAGES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/* eslint-disable @typescript-eslint/no-require-imports */
"use server";

import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an image to the public/uploads directory
 * @param file The file to upload
 * @param subfolder Optional subfolder within uploads directory
 * @returns The relative URL path to the uploaded image
 */
export async function uploadImage(
  file: File,
  subfolder: string = ""
): Promise<string> {
  try {
    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with original extension
    const originalName = file.name;
    const extension = originalName.split(".").pop() || "jpg";
    const uniqueFilename = `${uuidv4()}.${extension}`;

    // Create directory path (with subfolder if provided)
    const directory = subfolder
      ? join(process.cwd(), "public", "uploads", subfolder)
      : join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    await createDirectoryIfNotExists(directory);

    // Path for saving the file
    const path = join(directory, uniqueFilename);

    // Write the file
    await writeFile(path, buffer);

    // Return the relative URL for the file
    return subfolder
      ? `/uploads/${subfolder}/${uniqueFilename}`
      : `/uploads/${uniqueFilename}`;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Creates directory if it doesn't exist
 */
async function createDirectoryIfNotExists(directory: string) {
  const fs = require("fs");
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

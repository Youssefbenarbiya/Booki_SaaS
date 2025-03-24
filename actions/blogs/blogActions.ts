/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import db from "@/db/drizzle"
import { blogs, agencies } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { uploadImages } from "@/actions/uploadActions"
import { v2 as cloudinary } from "cloudinary"

// If needed, ensure Cloudinary is configured. If already configured elsewhere, you can omit this.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper: Upload a file to Cloudinary using your existing action
async function uploadFileToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  return await uploadImages(formData)
}

function getPublicIdFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url)
    const parts = pathname.split("/")
    const folderIndex = parts.findIndex((part) => part === "uploads")
    if (folderIndex === -1 || folderIndex + 1 >= parts.length) {
      return null
    }
    const fileWithExt = parts[folderIndex + 1]
    const dotIndex = fileWithExt.lastIndexOf(".")
    const publicId =
      dotIndex === -1 ? fileWithExt : fileWithExt.substring(0, dotIndex)
    return `uploads/${publicId}`
  } catch (error) {
    console.error("Error parsing Cloudinary public_id:", error)
    return null
  }
}

export async function getBlogs(agencyId?: string) {
  try {
    // If agencyId is provided, filter blogs for that specific agency
    // Otherwise, return all blogs for public consumption
    const query = agencyId
      ? db.query.blogs.findMany({
          where: eq(blogs.agencyId, agencyId),
          with: {
            category: true,
            author: {
              columns: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: (blogs, { desc }) => [desc(blogs.createdAt)],
        })
      : db.query.blogs.findMany({
          with: {
            category: true,
            author: {
              columns: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: (blogs, { desc }) => [desc(blogs.createdAt)],
        })

    const allBlogs = await query
    return { blogs: allBlogs }
  } catch (error) {
    console.error("Failed to fetch blogs:", error)
    throw new Error("Failed to fetch blogs")
  }
}

export async function getBlogCategories() {
  try {
    const categories = await db.query.blogCategories.findMany({
      orderBy: (blogCategories, { asc }) => [asc(blogCategories.name)],
    })

    return { categories }
  } catch (error) {
    console.error("Failed to fetch blog categories:", error)
    throw new Error("Failed to fetch blog categories")
  }
}

export async function getBlogById(id: number) {
  try {
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, id),
      with: {
        category: true,
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return { blog }
  } catch (error) {
    console.error("Failed to fetch blog:", error)
    throw new Error("Failed to fetch blog")
  }
}

export async function createBlog(formData: FormData, authorId: string) {
  try {
    // Extract text data
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const categoryId = parseInt(formData.get("categoryId") as string)
    const published = formData.get("published") === "true"
    const readTime = parseInt(formData.get("readTime") as string)
    const tagsInput = formData.get("tags") as string
    const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : []

    // Process featured image
    const featuredImageFile = formData.get("featuredImage") as File
    let featuredImage = ""

    // Get all blog images (from ImageUploadSection)
    const imageFiles = formData.getAll("images") as File[]
    let uploadedImages: string[] = []

    // Basic validation
    if (!title || !content || isNaN(categoryId)) {
      return { error: "Missing required blog information" }
    }

    // Get the agency ID of the author
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, authorId),
      columns: {
        userId: true,
      },
    })

    // Upload featured image if provided
    if (featuredImageFile && featuredImageFile.size > 0) {
      featuredImage = await uploadFileToCloudinary(featuredImageFile)
    }

    // Upload additional images if provided
    if (imageFiles && imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles.map((file) => uploadFileToCloudinary(file))
      )
      uploadedImages = uploads
    }

    // Create blog in database - now with status: "pending"
    await db
      .insert(blogs)
      .values({
        title,
        content,
        excerpt,
        categoryId,
        authorId,
        agencyId: agency?.userId || null, // Set the agency ID if available
        published: false, // Set to false initially regardless of user input
        publishedAt: null, // Will be set when approved
        readTime,
        tags,
        featuredImage,
        images: uploadedImages,
        status: "pending", // Set initial status to pending
      })
      .returning()

    revalidatePath("/agency/dashboard/blogs")
    return { success: true, message: "Blog submitted for approval" }
  } catch (error) {
    console.error("Blog creation error:", error)
    return { error: "Failed to create blog" }
  }
}

export async function updateBlog(id: number, formData: FormData) {
  try {
    // Extract text fields
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const categoryId = parseInt(formData.get("categoryId") as string)
    const published = formData.get("published") === "true"
    const readTime = parseInt(formData.get("readTime") as string)
    const tagsInput = formData.get("tags") as string
    const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : []

    // Process featured image: Get the current URL from the form data
    const featuredImageFile = formData.get("featuredImage") as File
    let featuredImage = formData.get("currentFeaturedImage") as string

    // Basic validation
    if (!title || !content || isNaN(categoryId)) {
      return { error: "Missing required blog information" }
    }

    // Fetch the current blog data (including images and featured image)
    const currentBlog = await db.query.blogs.findFirst({
      where: eq(blogs.id, id),
      columns: {
        published: true,
        publishedAt: true,
        images: true,
        featuredImage: true,
        status: true,
      },
    })
    if (!currentBlog) {
      return { error: "Blog not found" }
    }

    // --- Handle Featured Image Replacement ---
    if (featuredImageFile && featuredImageFile.size > 0) {
      // Delete the old featured image from Cloudinary, if one exists.
      if (currentBlog.featuredImage) {
        const publicId = getPublicIdFromUrl(currentBlog.featuredImage)
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId)
          } catch (error) {
            console.error("Failed to delete old featured image:", error)
          }
        }
      }
      // Upload the new featured image.
      featuredImage = await uploadFileToCloudinary(featuredImageFile)
    }

    // --- Handle Blog Images ---
    // Get the list of images to keep from the form data
    const remainingImagesStr = formData.get("remainingImages") as string
    let updatedImages: string[] = []

    try {
      // Parse the remaining images, if the field exists
      if (remainingImagesStr) {
        updatedImages = JSON.parse(remainingImagesStr)
      }
    } catch (error) {
      console.error("Error parsing remainingImages:", error)
      // Fall back to current images if parsing fails
      updatedImages = currentBlog.images || []
    }

    // Determine which images have been removed from the blog
    const currentImages = currentBlog.images || []
    const imagesToDelete = currentImages.filter(
      (img) => !updatedImages.includes(img)
    )

    // Delete each removed image from Cloudinary
    if (imagesToDelete.length > 0) {
      console.log(`Deleting ${imagesToDelete.length} images from Cloudinary`)

      await Promise.all(
        imagesToDelete.map(async (img: string) => {
          const publicId = getPublicIdFromUrl(img)
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId)
              console.log(`Deleted image ${publicId} from Cloudinary`)
            } catch (error) {
              console.error(
                `Failed to delete image ${img} from Cloudinary:`,
                error
              )
            }
          }
        })
      )
    }

    // Process any new images uploaded during the update.
    const imageFiles = formData.getAll("images") as File[]
    if (imageFiles && imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles
          .filter((file) => file.size > 0)
          .map((file) => uploadFileToCloudinary(file))
      )
      updatedImages = [...updatedImages, ...uploads]
    }

    // Determine publishedAt value.
    let publishedAt = null
    if (published) {
      publishedAt = !currentBlog.published
        ? new Date()
        : currentBlog.publishedAt
    }

    // If blog was already published and approved, allow updates without changing status
    // Otherwise, any updates to a pending/rejected blog will put it back into pending status
    let status = currentBlog.status
    let actualPublished = published

    // If blog wasn't already approved and published, updates require re-approval
    if (currentBlog.status !== "approved" || !currentBlog.published) {
      status = "pending"
      actualPublished = false // Can't be published until approved
    }

    // Update the blog in the database
    await db
      .update(blogs)
      .set({
        title,
        content,
        excerpt,
        categoryId,
        published: actualPublished,
        publishedAt,
        readTime,
        tags,
        featuredImage,
        images: updatedImages, // Only the remaining (and new) images remain in the DB
        status: status, // Set status based on our logic above
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id))

    revalidatePath("/agency/dashboard/blogs")
    revalidatePath(`/agency/dashboard/blogs/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Blog update error:", error)
    return { error: "Failed to update blog" }
  }
}

export async function deleteBlog(id: number) {
  try {
    // Optionally, before deleting the blog from the database,
    // you could fetch the blog and remove its images from Cloudinary.
    // For now, we simply delete the blog record.
    await db.delete(blogs).where(eq(blogs.id, id))
    revalidatePath("/agency/dashboard/blogs")
  } catch (error) {
    console.error("Blog deletion error:", error)
    throw new Error("Failed to delete blog")
  }
}

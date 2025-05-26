/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import db from "@/db/drizzle";
import { blogs, agencies, agencyEmployees, blogCategories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, sql, desc, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendBlogApprovalRequest } from "../admin/adminNotifications";
import { createNewBlogNotification } from "../admin/notificationActions";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ===== HELPER FUNCTIONS =====

/**
 * Upload a file to Cloudinary
 */
async function uploadToCloudinary(
  file: File,
  folder: string = "blog"
): Promise<string> {
  try {
    if (!file || file.size === 0) {
      throw new Error("Invalid file");
    }

    // Create a buffer from the file
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a unique filename
    const fileName = `${uuidv4()}_${file.name.replace(/\s+/g, "_")}`;

    // Create a promise to handle the upload
    return new Promise((resolve, reject) => {
      // Upload stream to Cloudinary
      const uploadOptions = {
        resource_type: "auto",
        folder: folder,
        public_id: fileName.split(".")[0], // Remove extension from public_id
        overwrite: true,
      };

      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Failed to upload image"));
            return;
          }
          resolve(result.secure_url);
        })
        .end(buffer);
    });
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Delete a file from Cloudinary
 */
async function deleteFromCloudinary(url: string): Promise<boolean> {
  try {
    if (!url || !url.includes("cloudinary.com")) {
      return false;
    }

    // Extract public_id from the URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    const urlParts = url.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicIdParts = publicIdWithExtension.split(".");
    const extension = publicIdParts.pop(); // Remove extension

    const folderName = urlParts[urlParts.length - 2];
    const publicId = `${folderName}/${publicIdParts.join(".")}`;

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error(`Failed to delete file from Cloudinary:`, error);
    return false;
  }
}

/**
 * Get agency ID for a user (either owner or employee)
 */
async function getAgencyIdForUser(userId: string): Promise<string | null> {
  try {
    // Check if user is an agency owner
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, userId),
    });

    if (agency) {
      return agency.userId;
    }

    // Check if user is an employee
    const employeeRecord = await db.query.agencyEmployees.findFirst({
      where: eq(agencyEmployees.employeeId, userId),
    });

    if (employeeRecord) {
      return employeeRecord.agencyId;
    }

    return null;
  } catch (error) {
    console.error("Error getting agency ID:", error);
    return null;
  }
}

// ===== BLOG ACTIONS =====

/**
 * Get all blogs, filtered by agency if userId is provided
 */
export async function getBlogs(userId?: string) {
  try {
    // If userId is provided, get blogs for that user's agency
    let agencyId = null;
    if (userId) {
      agencyId = await getAgencyIdForUser(userId);
    }

    // Build query based on whether we're filtering by agency
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
          orderBy: [desc(blogs.createdAt)],
        })
      : db.query.blogs.findMany({
          where: eq(blogs.status, "approved"), // Only show approved blogs for public
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
          orderBy: [desc(blogs.createdAt)],
        });

    const allBlogs = await query;
    return { blogs: allBlogs };
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return { blogs: [], error: "Failed to fetch blogs" };
  }
}

/**
 * Get all blog categories
 */
export async function getBlogCategories() {
  try {
    const categories = await db.query.blogCategories.findMany({
      orderBy: [asc(blogCategories.name)],
    });

    return { categories };
  } catch (error) {
    console.error("Failed to fetch blog categories:", error);
    return { categories: [], error: "Failed to fetch blog categories" };
  }
}

/**
 * Get a single blog by ID
 */
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
    });

    // Increment view count
    if (blog) {
      await incrementBlogViews(id);
    }

    return { blog };
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return { blog: null, error: "Failed to fetch blog" };
  }
}

/**
 * Create a new blog post
 */
export async function createBlog(formData: FormData, authorId: string) {
  try {
    // Extract text data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const categoryId = Number.parseInt(formData.get("categoryId") as string);
    const readTime = Number.parseInt(formData.get("readTime") as string) || 5;
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : [];

    // Basic validation
    if (!title || !content || isNaN(categoryId)) {
      return { error: "Missing required blog information" };
    }

    // Get the agency ID of the author
    const agencyId = await getAgencyIdForUser(authorId);
    if (!agencyId) {
      return { error: "No agency found for this user" };
    }

    // Process featured image - upload to Cloudinary
    const featuredImageFile = formData.get("featuredImage") as File;
    let featuredImage = "";
    if (featuredImageFile && featuredImageFile.size > 0) {
      featuredImage = await uploadToCloudinary(
        featuredImageFile,
        "blog/featured"
      );
    }

    // Upload additional images if provided
    const imageFiles = formData.getAll("images") as File[];
    let uploadedImages: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles
          .filter((file) => file.size > 0)
          .map((file) => uploadToCloudinary(file, "blog/gallery"))
      );
      uploadedImages = uploads;
    }

    // Create blog in database
    const [newBlog] = await db
      .insert(blogs)
      .values({
        title,
        content,
        excerpt,
        categoryId,
        authorId,
        agencyId,
        published: false, // Set to false initially
        publishedAt: null, // Will be set when approved
        readTime,
        tags,
        featuredImage,
        images: uploadedImages,
        status: "pending", // Set initial status to pending
      })
      .returning();

    // Send notification email to admin
    await sendBlogApprovalRequest(newBlog.id);

    // Create admin notification for the new blog
    try {
      // Get agency name for the notification
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.userId, agencyId),
      });

      await createNewBlogNotification(
        newBlog.id,
        title,
        agency?.agencyName || "Agency"
      );
    } catch (error) {
      console.error("Failed to create admin notification:", error);
      // Continue even if notification creation fails
    }

    revalidatePath("/agency/dashboard/blogs");
    revalidatePath("/blog");

    return {
      success: true,
      message: "Blog submitted for approval",
      blog: newBlog,
    };
  } catch (error) {
    console.error("Blog creation error:", error);
    return { error: "Failed to create blog" };
  }
}

/**
 * Update an existing blog post
 */
export async function updateBlog(id: number, formData: FormData) {
  try {
    // Extract text fields
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const categoryId = Number.parseInt(formData.get("categoryId") as string);
    const published = formData.get("published") === "true";
    const readTime = Number.parseInt(formData.get("readTime") as string) || 5;
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : [];

    // Get current featured image URL
    const featuredImageFile = formData.get("featuredImage") as File;
    let featuredImage = formData.get("currentFeaturedImage") as string;

    // Basic validation
    if (!title || !content || isNaN(categoryId)) {
      return { error: "Missing required blog information" };
    }

    // Fetch the current blog data
    const currentBlog = await db.query.blogs.findFirst({
      where: eq(blogs.id, id),
      columns: {
        published: true,
        publishedAt: true,
        images: true,
        featuredImage: true,
        status: true,
      },
    });

    if (!currentBlog) {
      return { error: "Blog not found" };
    }

    // Handle featured image replacement
    if (featuredImageFile && featuredImageFile.size > 0) {
      // Delete old featured image if it exists
      if (currentBlog.featuredImage) {
        await deleteFromCloudinary(currentBlog.featuredImage);
      }
      // Upload new featured image
      featuredImage = await uploadToCloudinary(
        featuredImageFile,
        "blog/featured"
      );
    }

    // Handle blog images
    const remainingImagesStr = formData.get("remainingImages") as string;
    let updatedImages: string[] = [];

    try {
      // Parse the remaining images
      if (remainingImagesStr) {
        updatedImages = JSON.parse(remainingImagesStr);
      }
    } catch (error) {
      console.error("Error parsing remainingImages:", error);
      updatedImages = currentBlog.images || [];
    }

    // Delete removed images from Cloudinary
    const currentImages = currentBlog.images || [];
    const imagesToDelete = currentImages.filter(
      (img) => !updatedImages.includes(img)
    );

    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map((img) => deleteFromCloudinary(img)));
    }

    // Process new images
    const imageFiles = formData.getAll("images") as File[];
    if (imageFiles && imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles
          .filter((file) => file.size > 0)
          .map((file) => uploadToCloudinary(file, "blog/gallery"))
      );
      updatedImages = [...updatedImages, ...uploads];
    }

    // Determine publishedAt value
    let publishedAt = null;
    if (published) {
      publishedAt = !currentBlog.published
        ? new Date()
        : currentBlog.publishedAt;
    }

    // Determine status based on current state
    let status = currentBlog.status;
    let actualPublished = published;

    // If blog wasn't already approved and published, updates require re-approval
    if (currentBlog.status !== "approved" || !currentBlog.published) {
      status = "pending";
      actualPublished = false; // Can't be published until approved
    }

    // Update the blog in the database
    const [updatedBlog] = await db
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
        images: updatedImages,
        status,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id))
      .returning();

    revalidatePath("/agency/dashboard/blogs");
    revalidatePath(`/agency/dashboard/blogs/${id}`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${id}`);
    revalidatePath(`/blog/category/${categoryId}`);

    return {
      success: true,
      blog: updatedBlog,
    };
  } catch (error) {
    console.error("Blog update error:", error);
    return { error: "Failed to update blog" };
  }
}

/**
 * Delete a blog post and its associated images
 */
export async function deleteBlog(id: number) {
  try {
    // Get the blog to delete its images
    const blogToDelete = await db.query.blogs.findFirst({
      where: eq(blogs.id, id),
      columns: {
        featuredImage: true,
        images: true,
        categoryId: true,
      },
    });

    if (blogToDelete) {
      // Delete featured image if it exists
      if (blogToDelete.featuredImage) {
        await deleteFromCloudinary(blogToDelete.featuredImage);
      }

      // Delete all blog images
      if (blogToDelete.images && blogToDelete.images.length > 0) {
        await Promise.all(
          blogToDelete.images.map((img) => deleteFromCloudinary(img))
        );
      }

      // Store category ID for path revalidation
      const categoryId = blogToDelete.categoryId;

      // Delete the blog from the database
      await db.delete(blogs).where(eq(blogs.id, id));

      // Revalidate all relevant paths
      revalidatePath("/agency/dashboard/blogs");
      revalidatePath("/blog");
      if (categoryId) {
        revalidatePath(`/blog/category/${categoryId}`);
      }

      return { success: true };
    } else {
      return { error: "Blog not found" };
    }
  } catch (error) {
    console.error("Blog deletion error:", error);
    return { error: "Failed to delete blog" };
  }
}

/**
 * Create a new blog category
 */
export async function createCategory(name: string, description?: string) {
  try {
    // Basic validation
    if (!name || name.trim() === "") {
      return { error: "Category name is required" };
    }

    // Check if category already exists (case insensitive)
    const existingCategory = await db.query.blogCategories.findFirst({
      where: sql`LOWER(${blogCategories.name}) = LOWER(${name.trim()})`,
    });

    if (existingCategory) {
      return { error: "Category already exists", category: existingCategory };
    }

    // Create new category
    const [newCategory] = await db
      .insert(blogCategories)
      .values({
        name: name.trim(),
        description: description?.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/agency/dashboard/blogs");
    revalidatePath("/blog");

    return { success: true, category: newCategory };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { error: "Failed to create category" };
  }
}

/**
 * Update blog status (for admin approval workflow)
 */
export async function updateBlogStatus(
  id: number,
  status: "pending" | "approved" | "rejected"
) {
  try {
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, id),
      columns: {
        published: true,
        publishedAt: true,
        categoryId: true,
      },
    });

    if (!blog) {
      return { error: "Blog not found" };
    }

    // Update status and set publishedAt if approving
    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    // If approving and published flag is true, set publishedAt
    if (status === "approved" && blog.published) {
      updates.publishedAt = blog.publishedAt || new Date();
    }

    // If rejecting, unpublish
    if (status === "rejected") {
      updates.published = false;
      updates.publishedAt = null;
    }

    const [updatedBlog] = await db
      .update(blogs)
      .set(updates)
      .where(eq(blogs.id, id))
      .returning();

    revalidatePath("/agency/dashboard/blogs");
    revalidatePath(`/agency/dashboard/blogs/${id}`);
    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    revalidatePath(`/blog/${id}`);
    if (blog.categoryId) {
      revalidatePath(`/blog/category/${blog.categoryId}`);
    }

    return { success: true, blog: updatedBlog };
  } catch (error) {
    console.error("Failed to update blog status:", error);
    return { error: "Failed to update blog status" };
  }
}

/**
 * Increment blog view count
 */
export async function incrementBlogViews(id: number) {
  try {
    await db
      .update(blogs)
      .set({
        views: sql`${blogs.views} + 1`,
      })
      .where(eq(blogs.id, id));

    return { success: true };
  } catch (error) {
    console.error("Failed to increment blog views:", error);
    return { error: "Failed to increment blog views" };
  }
}

/**
 * Get related blogs based on category or tags
 */
export async function getRelatedBlogs(blogId: number, limit: number = 3) {
  try {
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
      columns: {
        categoryId: true,
        tags: true,
      },
    });

    if (!blog) {
      return { blogs: [] };
    }

    // Get blogs with the same category, excluding the current blog
    const relatedBlogs = await db.query.blogs.findMany({
      where: sql`${blogs.id} != ${blogId} AND ${blogs.categoryId} = ${blog.categoryId} AND ${blogs.status} = 'approved'`,
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
      limit,
      orderBy: [desc(blogs.publishedAt)],
    });

    return { blogs: relatedBlogs };
  } catch (error) {
    console.error("Failed to fetch related blogs:", error);
    return { blogs: [], error: "Failed to fetch related blogs" };
  }
}

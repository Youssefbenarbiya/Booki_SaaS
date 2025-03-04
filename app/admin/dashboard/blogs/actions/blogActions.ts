"use server";

import db from "@/db/drizzle";
import { blogs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { uploadImage } from "@/app/actions/uploadAction";

export async function getBlogs() {
  try {
    const allBlogs = await db.query.blogs.findMany({
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
    });

    return { blogs: allBlogs };
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    throw new Error("Failed to fetch blogs");
  }
}

export async function getBlogCategories() {
  try {
    const categories = await db.query.blogCategories.findMany({
      orderBy: (blogCategories, { asc }) => [asc(blogCategories.name)],
    });

    return { categories };
  } catch (error) {
    console.error("Failed to fetch blog categories:", error);
    throw new Error("Failed to fetch blog categories");
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
    });

    return { blog };
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    throw new Error("Failed to fetch blog");
  }
}

export async function createBlog(formData: FormData, authorId: string) {
  try {
    // Extract text data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const categoryId = parseInt(formData.get("categoryId") as string);
    const published = formData.get("published") === "true";
    const readTime = parseInt(formData.get("readTime") as string);
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : [];

    // Process featured image
    const featuredImageFile = formData.get("featuredImage") as File;
    let featuredImage = "";

    // Get all blog images (from ImageUploadSection)
    const imageFiles = formData.getAll("images") as File[];
    let uploadedImages: string[] = [];

    // Basic validation
    if (!title || !content || isNaN(categoryId)) {
      return { error: "Missing required blog information" };
    }

    // Upload featured image if provided
    if (featuredImageFile && featuredImageFile.size > 0) {
      featuredImage = await uploadImage(featuredImageFile, "blog-featured");
    }

    // Upload additional images if provided
    if (imageFiles && imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles.map((file) => uploadImage(file, "blog-images"))
      );
      uploadedImages = uploads;
    }

    // Create blog in database
    const result = await db
      .insert(blogs)
      .values({
        title,
        content,
        excerpt,
        categoryId,
        authorId,
        published,
        publishedAt: published ? new Date() : null,
        readTime,
        tags,
        featuredImage,
        images: uploadedImages,
      })
      .returning();

    revalidatePath("/admin/dashboard/blogs");
    return { success: true };
  } catch (error) {
    console.error("Blog creation error:", error);
    return { error: "Failed to create blog" };
  }
}

export async function updateBlog(id: number, formData: FormData) {
  try {
    // Extract text data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const categoryId = parseInt(formData.get("categoryId") as string);
    const published = formData.get("published") === "true";
    const readTime = parseInt(formData.get("readTime") as string);
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : [];

    // Process featured image
    const featuredImageFile = formData.get("featuredImage") as File;
    let featuredImage = formData.get("currentFeaturedImage") as string;

    // Get all blog images
    const imageFiles = formData.getAll("images") as File[];
    let currentImages = JSON.parse(
      (formData.get("currentImages") as string) || "[]"
    );

    // Basic validation
    if (!title || !content || isNaN(categoryId)) {
      return { error: "Missing required blog information" };
    }

    // Upload featured image if a new one is provided
    if (featuredImageFile && featuredImageFile.size > 0) {
      featuredImage = await uploadImage(featuredImageFile, "blog-featured");
    }

    // Upload additional images if new ones are provided
    if (imageFiles && imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles.map((file) => uploadImage(file, "blog-images"))
      );
      currentImages = [...currentImages, ...uploads];
    }

    // Prepare publishedAt value
    let publishedAt = null;

    // If blog is being published now
    if (published) {
      const currentBlog = await db.query.blogs.findFirst({
        where: eq(blogs.id, id),
        columns: { published: true, publishedAt: true },
      });

      // Set publishedAt to now if it's newly published
      if (!currentBlog?.published) {
        publishedAt = new Date();
      } else {
        // Keep the original publishedAt date
        publishedAt = currentBlog.publishedAt;
      }
    }

    // Update blog in database
    await db
      .update(blogs)
      .set({
        title,
        content,
        excerpt,
        categoryId,
        published,
        publishedAt,
        readTime,
        tags,
        featuredImage,
        images: currentImages,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id));

    revalidatePath("/admin/dashboard/blogs");
    return { success: true };
  } catch (error) {
    console.error("Blog update error:", error);
    return { error: "Failed to update blog" };
  }
}

export async function deleteBlog(id: number) {
  try {
    await db.delete(blogs).where(eq(blogs.id, id));
    revalidatePath("/admin/dashboard/blogs");
  } catch (error) {
    console.error("Blog deletion error:", error);
    throw new Error("Failed to delete blog");
  }
}

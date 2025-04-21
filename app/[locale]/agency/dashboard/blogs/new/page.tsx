import { getBlogCategories } from "../../../../../actions/blogs/blogActions"
import { BlogForm } from "./blog-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function NewBlogPage() {
  // Get the current user session properly
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/en/sign-in")
  }

  // Get all blog categories for the form
  const { categories } = await getBlogCategories()

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Create New Blog</h2>
      <BlogForm categories={categories} authorId={session.user.id} />
    </div>
  )
}

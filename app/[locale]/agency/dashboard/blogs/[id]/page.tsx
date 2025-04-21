import { notFound } from "next/navigation"
import { getBlogById, getBlogCategories } from "@/actions/blogs/blogActions"
import { BlogForm } from "../new/blog-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Locale } from "@/i18n/routing"

interface BlogEditPageProps {
  params: {
    id: string
    locale: Locale
  }
}

export default async function BlogEditPage({ params }: BlogEditPageProps) {
  const { id: blogId, locale } = params

  // Ensure params is correctly typed
  if (!blogId) {
    notFound()
  }

  // Get the current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  // Parse the blog ID safely
  const id = Number(blogId)
  if (isNaN(id)) {
    notFound()
  }

  // Fetch blog and categories
  const [{ blog }, { categories }] = await Promise.all([
    getBlogById(id).catch(() => ({ blog: null })), // Avoid throwing inside Promise.all
    getBlogCategories(),
  ])

  // Check if blog exists
  if (!blog) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Edit Blog</h2>
      <BlogForm
        initialData={{
          ...blog,
          views: blog.views || 0, // Ensure views is always a number
        }}
        categories={categories}
        isEditing={true}
        authorId={session.user.id}
        locale={locale}
      />
    </div>
  )
}

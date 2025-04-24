import db from "@/db/drizzle"
import { blogs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { BlogApprovalActions } from "@/components/dashboard/admin/BlogApprovalActions"
import { format } from "date-fns"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default async function AdminBlogDetailPage({
  params,
}: {
  params: { id: string; locale: string }
}) {
  const { id, locale } = params
  const blogId = parseInt(id)

  if (isNaN(blogId)) {
    return notFound()
  }

  const blog = await db.query.blogs.findFirst({
    where: eq(blogs.id, blogId),
    with: {
      author: true,
      category: true,
    },
  })

  if (!blog) {
    return notFound()
  }

  // Status badge color
  const statusColor = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
  }[blog.status || "pending"]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
        <div className="flex items-center space-x-2">
          <Link
            href={`/${locale}/admin/verify-blogs`}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Blog Verification
          </Link>
          {blog.status === "pending" && (
            <BlogApprovalActions blogId={blog.id} />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Blog Details</CardTitle>
            <Badge className={statusColor}>
              {blog.status?.toUpperCase() || "PENDING"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {blog.featuredImage && (
            <div className="mb-6">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                width={1200}
                height={400}
                className="w-full max-h-[400px] object-cover rounded-md"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Author</h3>
              <p className="text-base">
                {blog.author?.name || "Unknown Author"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Category</h3>
              <p className="text-base">
                {blog.category?.name || "Uncategorized"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">
                Created At
              </h3>
              <p className="text-base">
                {blog.createdAt
                  ? format(new Date(blog.createdAt), "PPP")
                  : "Unknown"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Read Time</h3>
              <p className="text-base">{blog.readTime || 0} min</p>
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-gray-500">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {blog.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-100"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Excerpt
            </h3>
            <p className="text-base bg-gray-50 p-3 rounded-md italic">
              {blog.excerpt || "No excerpt provided"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Content
            </h3>
            <div className="prose max-w-none bg-gray-50 p-4 rounded-md">
              {/* We'd ideally want to render this as HTML with a safe HTML renderer */}
              <div dangerouslySetInnerHTML={{ __html: blog.content || "" }} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-gray-500">
            Last updated:{" "}
            {blog.updatedAt ? format(new Date(blog.updatedAt), "PPP") : "N/A"}
          </div>
          {blog.status === "pending" && (
            <BlogApprovalActions blogId={blog.id} />
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

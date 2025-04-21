import db from "@/db/drizzle"
import { blogs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { BlogApprovalActions } from "@/components/dashboard/admin/BlogApprovalActions"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

export default async function VerifyBlogsPage({
  params,
}: {
  params: { locale: string }
}) {
  const { locale } = params

  // Get all pending blogs
  const pendingBlogs = await db.query.blogs.findMany({
    where: eq(blogs.status, "pending"),
    with: {
      author: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
    },
    orderBy: (blogs, { desc }) => [desc(blogs.createdAt)],
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Verify Blogs</h1>

      {pendingBlogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-md shadow">
          <p className="text-gray-500">No pending blogs to verify</p>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blog Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingBlogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {blog.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {blog.excerpt || blog.content?.substring(0, 100)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {blog.author?.image && (
                        <Image
                          src={blog.author.image}
                          alt={blog.author?.name || "Author"}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      )}
                      <div className="text-sm text-gray-900">
                        {blog.author?.name || "Unknown Author"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {blog.category?.name || "Uncategorized"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {blog.createdAt
                        ? formatDistanceToNow(new Date(blog.createdAt), {
                            addSuffix: true,
                          })
                        : "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/${locale}/admin/blogs/${blog.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BlogApprovalActions blogId={blog.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

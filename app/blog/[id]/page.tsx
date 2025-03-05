import Image from "next/image"
import Link from "next/link"
import { getBlogById, getBlogs } from "@/actions/blogActions"
import { notFound } from "next/navigation"

// Generate static params for blogs
export async function generateStaticParams() {
  const { blogs = [] } = await getBlogs()

  return blogs.map((blog) => ({
    id: blog.id.toString(),
  }))
}

export default async function BlogDetail({
  params: promiseParams,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: paramId } = await promiseParams
  const blogId = parseInt(paramId)

  const { blog } = await getBlogById(blogId)

  if (!blog) {
    return notFound()
  }

  return (
    <div className="flex max-w-6xl mx-auto px-4 py-8 gap-8">
      {/* Main Content */}
      <div className="flex-grow max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-2">
            {blog.category?.name || "Uncategorized"}
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">{blog.title}</h1>
          <div className="flex items-center gap-3 mt-4">
            {blog.author?.image && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={blog.author.image}
                  alt={blog.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className="font-medium">
                {blog.author?.name || "Anonymous"}
              </div>
              <div className="text-sm text-gray-500">
                {blog.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString()
                  : "Draft"}{" "}
                · {blog.readTime || "5"} min read
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={blog.featuredImage || "/assets/blog1.jpeg"}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />

          {/* Show additional images if available */}
          {blog.images?.length > 0 && (
            <div className="mt-8 space-y-8">
              {blog.images.map((image, index) => (
                <div
                  key={index}
                  className="relative h-[300px] rounded-lg overflow-hidden"
                >
                  <Image
                    src={image}
                    alt={`${blog.title} - image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 shrink-0 space-y-8 hidden lg:block">
        {/* Author */}
        {blog.author && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Author</h3>
            <div className="flex items-center gap-4">
              {blog.author.image && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={blog.author.image}
                    alt={blog.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h4 className="font-medium">{blog.author.name}</h4>
              </div>
            </div>
          </div>
        )}

        {/* Recent Posts */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Posts</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <Link
                href={`/blog/recent-post-${index}`}
                key={index}
                className="group flex gap-3"
              >
                <div className="relative w-20 h-20 shrink-0 rounded overflow-hidden">
                  <Image
                    src="/assets/blog1.jpeg"
                    alt="Recent post"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium group-hover:text-orange-500 line-clamp-2">
                    Travel Stories For Now and the Future
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">8 Places in 2022</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            <Link
              href="/blog?category=perfect"
              className="block text-gray-600 hover:text-orange-500"
            >
              Perfect
            </Link>
            <Link
              href="/blog?category=tips"
              className="block text-gray-600 hover:text-orange-500"
            >
              Tips
            </Link>
            <Link
              href="/blog?category=destination"
              className="block text-gray-600 hover:text-orange-500"
            >
              Destination
            </Link>
          </div>
        </div>

        {/* Have Any Questions Box */}
        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Have Any Questions?</h3>
          <p className="text-gray-600 mb-4">
            Ready to help if you have any questions, we will provide a solution.
          </p>
          <div className="flex items-center text-orange-500">
            <span className="mr-2">📞</span>
            <span>+216 99 999 999</span>
          </div>
          <div className="flex items-center text-orange-500 mt-2">
            <span className="mr-2">✉️</span>
            <span>book1@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}

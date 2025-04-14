import Image from "next/image"
import Link from "next/link"
import { getBlogs, getBlogCategories } from "@/actions/blogs/blogActions"
import { ChatScript } from "@/components/chat/ChatScript"
import { Clock, Calendar, Tag } from "lucide-react"

export default async function BlogPage() {
  const { blogs = [] } = await getBlogs()
  const { categories = [] } = await getBlogCategories()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        
        {/* Category Filter */}
        <div className="mb-10 flex flex-wrap gap-3 justify-center">
          <Link
            href="/blog"
            className="px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition duration-200"
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog/category/${category.id}`}
              className="px-5 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition duration-300 flex flex-col h-full">
                
                {/* Optional Image */}
                {post.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Category header */}
                <div className="bg-orange-100 text-orange-700 text-xs font-semibold px-4 py-2">
                  {post.category?.name || "Uncategorized"}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{post.readTime || 5} min read</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md flex items-center gap-1"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
                    {post.author?.image ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={post.author.image}
                          alt={post.author.name || "Author"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 text-sm font-bold">
                          {post.author?.name?.charAt(0) || "A"}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {post.author?.name || "Anonymous"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {blogs.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-medium text-gray-600">No blog posts found</h3>
            <p className="text-gray-500 mt-2">Check back later for new content</p>
          </div>
        )}
      </div>
      <ChatScript />
    </div>
  )
}

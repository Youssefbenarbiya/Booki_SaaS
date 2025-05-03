import Image from "next/image"
import Link from "next/link"
import { getBlogs } from "@/actions/blogs/blogActions"
import { Clock, Calendar, Tag } from "lucide-react"

export default async function BlogPage() {
  const { blogs = [] } = await getBlogs()

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="container mx-auto px-4 py-12">
        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="group">
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 h-full flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={post.featuredImage || "/assets/blog1.jpeg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={post.id < 2}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {post.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{post.readTime || 5} min read</span>
                    </div>
                  </div>

                  {/* Title and excerpt */}
                  <h2 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors">{post.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700 flex items-center gap-1"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author */}
                  <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                    {post.author?.image ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={post.author.image || "/placeholder.svg"}
                          alt={post.author.name || "Author"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-500 text-xs font-bold">{post.author?.name?.charAt(0) || "A"}</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">{post.author?.name || "Anonymous"}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {blogs.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-600">No blog posts found</h3>
            <p className="text-gray-500 mt-2">Check back later for new content</p>
          </div>
        )}
      </div>
      
    </div>
  )
}

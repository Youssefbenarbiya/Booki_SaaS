import Image from "next/image"
import Link from "next/link"
import { getBlogs } from "@/actions/blogActions"

export default async function BlogPage() {
  const { blogs = [] } = await getBlogs()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Tips & Articles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map((post) => (
          <Link href={`/blog/${post.id}`} key={post.id} className="group">
            <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
              <Image
                src={post.featuredImage || "/assets/blog1.jpeg"}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={post.id < 2}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{post.category.name}</p>
              <h2 className="text-xl font-semibold group-hover:text-orange-500 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-600">{post.excerpt}</p>
              <button className="text-orange-500 font-medium hover:text-orange-600">
                Read More
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

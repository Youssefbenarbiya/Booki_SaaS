"use client"
import Image from "next/image"
import Link from "next/link"

interface BlogPost {
  title: string
  category: string
  image: string
  content: {
    title: string
    description: string
    image: string
  }[]
}

export default function BlogDetail() {
  const blogPost: BlogPost = {
    title: "Travel Stories For Now and the Future",
    category: "Perfect | Tips",
    image: "/assets/blog1.jpeg",
    content: [
      {
        title: "Rice Terraces, Tegalalang",
        description: `The Tegalalang Rice Terraces in Ubud are famous for their beautiful scenes of rice paddies and their innovative irrigation system. Known as subak, the traditional Balinese irrigation system is now a UNESCO World Heritage Site. The rice terraces offer a perfect vantage point to observe the traditional Balinese farming techniques that have been passed down through generations.

The terraces are a testament to the Balinese people's harmonious relationship with nature, showcasing their sophisticated farming methods while creating breathtaking landscapes that attract visitors from around the world.`,
        image: "/assets/blog1.jpeg",
      },
    ],
  }

  return (
    <div className="flex max-w-6xl mx-auto px-4 py-8 gap-8">
      {/* Main Content */}
      <div className="flex-grow max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-2">{blogPost.category}</div>
          <h1 className="text-4xl font-serif font-bold mb-4">
            {blogPost.title}
          </h1>
        </div>

        {/* Hero Image */}
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={blogPost.image}
            alt={blogPost.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Sections */}
        <div className="prose max-w-none">
          {blogPost.content.map((section, index) => (
            <section key={index} className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                {section.description}
              </p>
              <div className="relative h-[300px] rounded-lg overflow-hidden">
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-cover"
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 shrink-0 space-y-8 hidden lg:block">
        {/* Recent Posts */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Post</h3>
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
                  <p className="text-xs text-gray-500 mt-1">8 Place in 2022</p>
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

        {/* Have Any Question Box */}
        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Have Any Question?</h3>
          <p className="text-gray-600 mb-4">
            Ready to help if you have any questions, we will help provide a
            solution.
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

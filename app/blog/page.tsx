"use client"
import Image from "next/image"
import Link from "next/link"

interface BlogPost {
  id: number;
  category: string;
  title: string;
  description: string;
  image: string;
}

export default function BlogPage() {
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      category: "Perfect | Tips",
      title: "8 Popular Travel Destination on Bali in 2022",
      description: "We have compiled a list of the most beautiful places in nature or cities that you can visit...",
      image: "/assets/blog1.jpeg",
    },
    {
      id: 2,
      category: "Tips | Travel",
      title: "How Are We Going to Travel in 2022",
      description: "Find out about the latest trends in traveling and what to expect in the coming year...",
      image: "/assets/blog1.jpeg",
    },
    {
      id: 3,
      category: "Perfect | Tips",
      title: "Travel Stories For Now and the Future",
      description: "Discover inspiring stories from travelers around the world and their unique experiences...",
      image: "/assets/blog1.jpeg",
    },
    {
      id: 4,
      category: "Perfect",
      title: "8 Popular Travel Destination on Bali in 2022",
      description: "Explore the most popular destinations in Bali that you shouldn't miss...",
      image: "/assets/blog1.jpeg",
    },
    {
      id: 5,
      category: "Perfect | Tips",
      title: "8 Popular Travel Destination on Bali in 2020",
      description: "A throwback to the most visited places in Bali before the pandemic...",
      image: "/assets/blog1.jpeg",
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Tips & Articles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <Link href={`/blog/detail?id=${post.id}`} key={post.id} className="group">
            <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={post.id < 2}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{post.category}</p>
              <h2 className="text-xl font-semibold group-hover:text-orange-500 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-600">{post.description}</p>
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

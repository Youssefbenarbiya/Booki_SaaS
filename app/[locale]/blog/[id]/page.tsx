import Image from "next/image";
import { getBlogById, getRelatedBlogs } from "@/actions/blogs/blogActions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { format } from "date-fns";
import Link from "next/link";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type BlogPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { blog } = await getBlogById(parseInt(params.id));
  
  if (!blog) {
    return {
      title: "Blog Not Found",
      description: "The requested blog could not be found.",
    };
  }
  
  return {
    title: blog.title,
    description: blog.excerpt || `Read ${blog.title} on Booki`,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || `Read ${blog.title} on Booki`,
      images: blog.featuredImage ? [blog.featuredImage] : [],
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const id = parseInt(params.id);
  const { blog } = await getBlogById(id);
  const { blogs: relatedBlogs } = await getRelatedBlogs(id, 3);
  
  if (!blog) {
    notFound();
  }
  
  const publishDate = blog.publishedAt 
    ? format(new Date(blog.publishedAt), "MMMM dd, yyyy") 
    : format(new Date(blog.createdAt || new Date()), "MMMM dd, yyyy");

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 md:px-6">
      {/* Blog Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {blog.title}
        </h1>

        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={blog.author?.image || ""}
              alt={blog.author?.name || ""}
            />
            <AvatarFallback>
              {blog.author?.name?.slice(0, 2).toUpperCase() || "BL"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {blog.author?.name || "Unknown"}
            </span>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{publishDate}</span>
              <span>•</span>
              <span>{blog.readTime || 5} min read</span>
              <span>•</span>
              <span>{blog.views} views</span>
            </div>
          </div>
        </div>

        {blog.category && (
          <Link href={`/blog/category/${blog.category.id}`}>
            <Badge variant="secondary" className="mb-4">
              {blog.category.name}
            </Badge>
          </Link>
        )}
      </div>

      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="flex justify-center mb-8">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            width={800}
            height={450}
            className="rounded-lg object-cover"
            priority
          />
        </div>
      )}

      {/* Blog Content */}
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      <Separator className="my-10" />

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map((relatedBlog) => (
              <Link href={`/blog/${relatedBlog.id}`} key={relatedBlog.id}>
                <Card className="h-full transition-all hover:shadow-md">
                  {relatedBlog.featuredImage && (
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={relatedBlog.featuredImage}
                        alt={relatedBlog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {relatedBlog.excerpt || ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { TipTapEditor } from "@/components/TipTapEditor"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createBlog, updateBlog } from "../../../../../actions/blogActions"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Define a schema for blog data validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  readTime: z.coerce
    .number()
    .min(1, "Read time must be at least 1 minute")
    .default(5),
  tags: z.string().optional(),
  published: z.boolean().default(false),
})

interface Category {
  id: number
  name: string
}

interface Blog {
  id: number
  title: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  images: string[]
  published: boolean
  publishedAt: Date | null
  categoryId: number | null
  authorId: string | null
  views: number
  readTime: number | null
  tags: string[] | null
}

interface BlogFormProps {
  initialData?: Blog
  categories: Category[]
  isEditing?: boolean
  authorId: string
}

export function BlogForm({
  initialData,
  categories,
  isEditing = false,
  authorId,
}: BlogFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>(
    initialData?.featuredImage || ""
  )
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    initialData?.images || []
  )
  const [uploadError, setUploadError] = useState("")
  const [editorContent, setEditorContent] = useState(initialData?.content || "")
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration issues by only showing editor after component mounts
  useEffect(() => {
    setIsMounted(true)
    setEditorContent(initialData?.content || "")
  }, [initialData?.content])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      categoryId: initialData?.categoryId?.toString() || "",
      readTime: initialData?.readTime || 5,
      tags: initialData?.tags?.join(", ") || "",
      published: initialData?.published || false,
    },
  })

  // Handle featured image upload
  const handleFeaturedImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > 6 * 1024 * 1024) {
        setUploadError("Featured image must be less than 6MB")
        return
      }

      setFeaturedImage(file)
      setFeaturedImagePreview(URL.createObjectURL(file))
      setUploadError("")
    }
  }

  // Handle editor content change
  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    form.setValue("content", content, { shouldValidate: true })
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      const formData = new FormData()

      // Add text data to formData
      formData.append("title", values.title)
      formData.append("content", editorContent)
      formData.append("excerpt", values.excerpt || "")
      formData.append("categoryId", values.categoryId)
      formData.append("readTime", values.readTime.toString())
      formData.append("tags", values.tags || "")
      formData.append("published", values.published.toString())

      // Add featured image if present
      if (featuredImage) {
        formData.append("featuredImage", featuredImage)
      }

      // Add existing featured image URL for update
      if (isEditing && initialData?.featuredImage) {
        formData.append("currentFeaturedImage", initialData.featuredImage)
      }

      // Add all images from ImageUploadSection
      if (images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image)
        })
      }

      // For updating, include current images
      if (isEditing && initialData?.images) {
        formData.append("currentImages", JSON.stringify(initialData.images))
      }

      if (isEditing && initialData) {
        const result = await updateBlog(initialData.id, formData)
        if (result.error) {
          toast.error(result.error)
          return
        }
      } else {
        const result = await createBlog(formData, authorId)
        if (result.error) {
          toast.error(result.error)
          return
        }
      }

      toast.success(
        isEditing ? "Blog updated successfully!" : "Blog created successfully!"
      )
      router.refresh()
      router.push("/agency/dashboard/blogs")
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blog Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter blog title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Read Time */}
          <FormField
            control={form.control}
            name="readTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Read Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="travel, adventure, tips (comma separated)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Separate tags with commas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published Status */}
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Published</FormLabel>
                  <FormDescription>
                    Set to published if you want the blog to be visible on the
                    site.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Featured Image Upload */}
          <div className="md:col-span-2">
            <div className="space-y-2">
              <label className="block font-medium">Featured Image</label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                  className="max-w-sm"
                />

                {featuredImagePreview && (
                  <div className="relative h-24 w-24">
                    <Image
                      src={featuredImagePreview}
                      alt="Featured image preview"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
            </div>
          </div>

          {/* Multiple Images Upload */}
          <div className="md:col-span-2">
            <ImageUploadSection
              label="Blog Images"
              images={images}
              setImages={setImages}
              previewUrls={previewUrls}
              setPreviewUrls={setPreviewUrls}
              uploadError={uploadError}
              setUploadError={setUploadError}
            />
          </div>

          {/* Excerpt */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief summary of your blog post"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A short summary that will be shown in blog listings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Main Content - TipTap Editor */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="content"
              render={() => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div className="border rounded-md">
                      {isMounted && (
                        <TipTapEditor
                          content={editorContent}
                          onChange={handleEditorChange}
                          placeholder="Write your blog content here..."
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading
            ? "Processing..."
            : isEditing
            ? "Update Blog"
            : "Create Blog"}
        </Button>
      </form>
    </Form>
  )
}

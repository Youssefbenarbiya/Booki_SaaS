"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deleteBlog } from "@/actions/blogs/blogActions"
import { useParams } from "next/navigation"

export type Blog = {
  id: number
  title: string
  excerpt: string | null
  featuredImage: string | null
  published: boolean
  publishedAt: Date | null
  views: number
  readTime: number | null
  createdAt: Date
  status: string
  author: {
    id: string
    name: string
    image: string | null
  } | null
  category: {
    id: number
    name: string
  } | null
}

export const columns: ColumnDef<Blog>[] = [
  {
    accessorKey: "featuredImage",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.featuredImage
      return image ? (
        <div className="relative w-16 h-12">
          <Image
            src={image}
            alt={row.getValue("title")}
            fill
            className="object-cover rounded"
          />
        </div>
      ) : (
        <div className="w-16 h-12 bg-gray-100 flex items-center justify-center rounded">
          <span className="text-xs text-gray-500">No image</span>
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const title: string = row.getValue("title")
      return (
        <div className="font-medium max-w-[200px] truncate" title={title}>
          {title}
        </div>
      )
    },
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category?.name || "Uncategorized"
      return <div>{category}</div>
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const author = row.original.author
      return author ? (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={author.image || ""}
              alt={author.name || "Author"}
            />
            <AvatarFallback>
              {author.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{author.name}</span>
        </div>
      ) : (
        "Unknown"
      )
    },
  },
  {
    accessorKey: "status",
    header: "Approval Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      let badgeVariant: "default" | "outline" | "secondary" | "destructive" =
        "secondary"
      const statusText = status.charAt(0).toUpperCase() + status.slice(1)
      let customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"

      if (status === "approved") {
        badgeVariant = "default"
        customClass = "bg-green-100 text-green-800 hover:bg-green-200"
      } else if (status === "rejected") {
        badgeVariant = "destructive"
        customClass = "bg-red-100 text-red-800 hover:bg-red-200"
      } else if (status === "pending") {
        badgeVariant = "secondary"
        customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      }

      return (
        <Badge variant={badgeVariant} className={customClass}>
          {statusText}
        </Badge>
      )
    },
  },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.getValue("published")
      return isPublished ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Published
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Draft
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.original.createdAt
      return (
        <div>
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "views",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Views
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const blog = row.original
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const params = useParams()
      const locale = params.locale as string

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/blog/${blog.id}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/agency/dashboard/blogs/${blog.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this blog?")
                ) {
                  deleteBlog(blog.id)
                }
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

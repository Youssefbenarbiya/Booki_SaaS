"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteBlog } from "@/actions/blogs/blogActions";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Blog = {
  id: number;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  published: boolean;
  publishedAt: Date | null;
  views: number | null;
  readTime: number | null;
  createdAt: Date;
  status: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
  rejectionReason?: string | null;
};

// Status cell component
function StatusCell({ value, rejectionReason }: { value: string; rejectionReason: string | null | undefined }) {
  const [showReason, setShowReason] = useState(false);
  
  let badgeVariant: "default" | "outline" | "secondary" | "destructive" = "secondary";
  let statusText = "Pending";
  let customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  
  if (value === "approved") {
    badgeVariant = "default";
    statusText = "Approved";
    customClass = "bg-green-100 text-green-800 hover:bg-green-200";
  } else if (value === "rejected") {
    badgeVariant = "destructive";
    statusText = "Rejected";
  } else if (value === "pending") {
    badgeVariant = "secondary";
    statusText = "Pending";
    customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  } else if (value === "archived") {
    badgeVariant = "outline";
    statusText = "Archived";
    customClass = "bg-amber-100 text-amber-800 hover:bg-amber-200";
  }
  
  // Get first two words if rejection reason exists
  const twoWords = rejectionReason?.split(" ").slice(0, 2).join(" ");
  const hasMoreWords = rejectionReason ? rejectionReason.split(" ").length > 2 : false;
  
  return (
    <div className="flex flex-col">
      <Badge variant={badgeVariant} className={customClass}>
        {statusText}
      </Badge>
      
      {value === "rejected" && rejectionReason && (
        <>
          <div className="text-xs text-red-600 mt-1">
            {twoWords}
            {hasMoreWords && (
              <button 
                onClick={() => setShowReason(true)}
                className="ml-1 text-blue-500 hover:underline"
              >
                ...view more
              </button>
            )}
          </div>
          
          <Dialog open={showReason} onOpenChange={setShowReason}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">Rejection Reason</DialogTitle>
              </DialogHeader>
              <p className="py-4">{rejectionReason}</p>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

export const columns: ColumnDef<Blog>[] = [
  {
    accessorKey: "featuredImage",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.featuredImage;
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
      );
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
      );
    },
    cell: ({ row }) => {
      const title: string = row.getValue("title");
      return (
        <div className="font-medium max-w-[200px] truncate" title={title}>
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category?.name || "Uncategorized";
      return <div>{category}</div>;
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const author = row.original.author;
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
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const rejectionReason = row.original.rejectionReason;
      
      return <StatusCell value={status} rejectionReason={rejectionReason} />;
    },
  },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.getValue("published");
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
      );
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
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <div>
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      );
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
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const blog = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const params = useParams();
      const locale = params.locale as string;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/${locale}/blog/${blog.id}`, "_blank")}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">View</span>
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              (window.location.href = `/${locale}/agency/dashboard/blogs/${blog.id}`)
            }
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Edit</span>
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (
                window.confirm("Are you sure you want to delete this blog?")
              ) {
                await deleteBlog(blog.id);
              }
            }}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <span className="sr-only">Delete</span>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

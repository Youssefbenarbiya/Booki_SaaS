import { Button } from "@/components/ui/button";
import { BlogsTable } from "./components/blogs-table";
import { columns } from "./components/columns";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getBlogs } from "./actions/blogActions";

export default async function BlogsPage() {
  const { blogs } = await getBlogs();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
        <Button asChild>
          <Link href="/admin/dashboard/blogs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Blog
          </Link>
        </Button>
      </div>

      <BlogsTable columns={columns} data={blogs} />
    </div>
  );
}

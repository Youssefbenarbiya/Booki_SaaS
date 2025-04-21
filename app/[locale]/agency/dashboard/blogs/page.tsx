import { Button } from "@/components/ui/button"
import { BlogsTable } from "./blogs-table"
import { columns } from "./columns"
import Link from "next/link"
import { Plus } from "lucide-react"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { getBlogs } from "@/actions/blogs/blogActions"


export default async function BlogsPage() {
  // Get the current session using the provided method
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const userId = session?.user?.id

  // Get blogs specific to this user's agency
  // Note: In createBlog function, blogs.agencyId is set to agency.userId
  const { blogs } = await getBlogs(userId)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
        <Button asChild>
          <Link href="/agency/dashboard/blogs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Blog
          </Link>
        </Button>
      </div>

      <BlogsTable columns={columns} data={blogs} />
    </div>
  )
}

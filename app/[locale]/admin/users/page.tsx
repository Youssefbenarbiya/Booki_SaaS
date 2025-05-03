import { DataTable } from "@/components/data-table"
import db from "@/db/drizzle"
import { user } from "@/db/schema"
import { desc } from "drizzle-orm"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { columns } from "./columns"

export default async function AdminUsersPage() {
  const users = await db.query.user.findMany({
    orderBy: desc(user.createdAt),
  })

  const formattedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }))

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p className="text-muted-foreground mb-6">
        Manage all users in the system. You can ban, change roles, or delete users.
      </p>
      
      <Suspense fallback={<UsersTableSkeleton />}>
        <DataTable columns={columns} data={formattedUsers} />
      </Suspense>
    </div>
  )
}

function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="rounded-md border">
        <Skeleton className="h-[500px] w-full" />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

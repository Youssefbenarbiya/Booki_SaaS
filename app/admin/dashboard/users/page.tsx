import { DataTable } from "./data-table"
import { columns } from "./columns"
import db from "@/db/drizzle"
import { user } from "@/db/schema"
import { desc } from "drizzle-orm"

export default async function UsersPage() {
  const users = await db.query.user.findMany({
    orderBy: desc(user.createdAt),
    limit: 100,
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <DataTable columns={columns} data={users} />
    </div>
  )
}

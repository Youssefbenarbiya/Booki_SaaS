import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Search } from "lucide-react"
import { searchAgencies, getAgencies } from "./agencies"
import Image from "next/image"

export default async function AgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}) {
  const sp = await searchParams
  const search = (sp?.search as string) || ""

  // Fetch agencies using the function from agencies.ts
  const filteredAgencies = await getAgencies(search)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Agencies Management
        </h1>
        <form action={searchAgencies}>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              name="searchTerm"
              placeholder="Search agencies..."
              defaultValue={search}
              className="max-w-xs"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency Name</TableHead>
              <TableHead>Agency ID</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgencies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-gray-500"
                >
                  {search
                    ? "No agencies found matching your search"
                    : "No agencies registered yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAgencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell className="font-medium">
                    {agency.agencyName}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {agency.agencyUniqueId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {agency.user?.image && (
                        <Image
                          src={agency.user.image}
                          alt={agency.user.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      )}
                      <span>{agency.user?.name || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{agency.contactEmail}</div>
                      <div>{agency.contactPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {agency.createdAt &&
                      formatDistanceToNow(new Date(agency.createdAt), {
                        addSuffix: true,
                      })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/agencies/${agency.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

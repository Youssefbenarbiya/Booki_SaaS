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
import { Eye, Search, CheckCircle2, XCircle, Clock } from "lucide-react"
import Image from "next/image"
import { getAgencies, searchAgencies } from "@/actions/admin/agencies"
import { Badge } from "@/components/ui/badge"

export default async function AgenciesPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const search = (sp?.search as string) || ""

  // Fetch agencies using the function from agencies.ts
  const filteredAgencies = await getAgencies(search)

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Agencies Management
        </h1>
        <form action={searchAgencies} className="w-full sm:w-auto mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              name="searchTerm"
              placeholder="Search agencies..."
              defaultValue={search}
              className="w-full max-w-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            />
            <input type="hidden" name="locale" value={locale} />{" "}
            {/* Add locale to the form data */}
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="hover:bg-blue-50 transition-colors"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Agency Name
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Agency ID
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Owner
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Contact
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Verification
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Registered
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgencies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    {search
                      ? "No agencies found matching your search."
                      : "No agencies registered yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgencies.map((agency) => (
                  <TableRow
                    key={agency.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-4 py-3 font-medium">
                      {agency.agencyName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500">
                      {agency.agencyUniqueId}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center">
                        {agency.user?.image ? (
                          <Image
                            src={agency.user.image}
                            alt={agency.user.name || "Agency owner"}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full mr-2 bg-gray-300" />
                        )}
                        <span className="text-sm text-gray-800">
                          {agency.user?.name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>{agency.contactEmail}</div>
                        <div>{agency.contactPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {agency.verificationStatus === "approved" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : agency.verificationStatus === "rejected" ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </Badge>
                      ) : agency.rneDocument || agency.patenteDocument || agency.cinDocument ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          Not Submitted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600">
                      {agency.createdAt &&
                        formatDistanceToNow(new Date(agency.createdAt), {
                          addSuffix: true,
                        })}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Link href={`/${locale}/admin/agencies/${agency.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">View</span>
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
    </div>
  )
}

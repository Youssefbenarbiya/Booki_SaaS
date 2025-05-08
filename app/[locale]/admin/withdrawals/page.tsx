import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

import Link from "next/link"
import { getWithdrawalRequests } from "@/actions/admin/withdrawalActions"
import { WithdrawalRequestActionButtons } from "@/components/dashboard/admin/WithdrawalRequestActionButtons"

interface WithdrawalRequest {
  id: number;
  createdAt: Date | string;
  agencyId: string;
  amount: number;
  bankName: string;
  accountHolderName: string;
  bankAccountNumber: string;
  status: string;
  processedAt?: Date | string | null;
  agency: {
    userId: string;
    agencyName: string;
    contactEmail?: string;
  };
}

export default async function AdminWithdrawalsPage() {
  const { withdrawalRequests } = await getWithdrawalRequests()
  
  // Group withdrawal requests by status
  const pendingRequests = withdrawalRequests.filter(
    (request: WithdrawalRequest) => request.status === "pending"
  )
  const approvedRequests = withdrawalRequests.filter(
    (request: WithdrawalRequest) => request.status === "approved"
  )
  const rejectedRequests = withdrawalRequests.filter(
    (request: WithdrawalRequest) => request.status === "rejected"
  )

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Withdrawal Requests</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <h2 className="font-medium text-gray-500">Pending</h2>
          <p className="text-3xl font-bold">{pendingRequests.length}</p>
        </Card>
        <Card className="p-4">
          <h2 className="font-medium text-gray-500">Approved</h2>
          <p className="text-3xl font-bold">{approvedRequests.length}</p>
        </Card>
        <Card className="p-4">
          <h2 className="font-medium text-gray-500">Rejected</h2>
          <p className="text-3xl font-bold">{rejectedRequests.length}</p>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">All Withdrawal Requests</h2>
          
          {withdrawalRequests.length === 0 ? (
            <p className="text-gray-500">No withdrawal requests found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Agency</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Bank Details</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalRequests.map((request: WithdrawalRequest) => (
                    <tr key={request.id} className="border-b">
                      <td className="py-4 text-sm">
                        {format(new Date(request.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-4 text-sm">
                        <Link 
                          href={`/admin/agencies/${request.agencyId}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {request.agency.agencyName}
                        </Link>
                      </td>
                      <td className="py-4 text-sm font-semibold">
                        ${request.amount.toFixed(2)}
                      </td>
                      <td className="py-4 text-sm">
                        <div>{request.accountHolderName}</div>
                        <div className="text-gray-500">{request.bankName}</div>
                        <div className="text-gray-500">{request.bankAccountNumber}</div>
                      </td>
                      <td className="py-4 text-sm">
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "outline"
                              : request.status === "approved"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm">
                        {request.status === "pending" && (
                          <WithdrawalRequestActionButtons requestId={request.id} />
                        )}
                        {request.status !== "pending" && (
                          <span className="text-gray-500 text-xs">
                            {request.processedAt ? `Processed on ${format(new Date(request.processedAt), "MMM d, yyyy")}` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

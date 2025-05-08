import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { WithdrawalRequestForm } from "@/components/dashboard/agency/WithdrawalRequestForm"
import { getAgencyTransactions, getAgencyWallet, getAgencyWithdrawalRequests } from "@/actions/agency/walletActions"

interface Transaction {
  id: number;
  createdAt: Date | string;
  description: string;
  type: string;
  amount: number;
}

interface WithdrawalRequest {
  id: number;
  createdAt: Date | string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  status: string;
  notes?: string | null;
}

export default async function WalletPage() {
  const { wallet } = await getAgencyWallet()
  const { transactions } = await getAgencyTransactions(20)
  const { withdrawalRequests } = await getAgencyWithdrawalRequests()

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Agency Wallet</h1>

      <div className="grid gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Current Balance</h2>
          <div className="text-4xl font-bold text-primary">
            {formatCurrency(wallet?.balance || 0)}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Available for withdrawal
          </p>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="request">Request Withdrawal</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 font-medium text-sm text-gray-500 border-b pb-2">
                  <div>Date</div>
                  <div>Description</div>
                  <div>Amount</div>
                  <div>Type</div>
                </div>
                {transactions.map((transaction: Transaction) => (
                  <div key={transaction.id} className="grid grid-cols-4 text-sm py-2 border-b border-gray-100">
                    <div>{format(new Date(transaction.createdAt), "MMM d, yyyy")}</div>
                    <div>{transaction.description}</div>
                    <div className={transaction.type === "credit" ? "text-green-600" : "text-red-600"}>
                      {transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div>
                      <Badge variant={transaction.type === "credit" ? "default" : "destructive"}>
                        {transaction.type === "credit" ? "Payment" : "Withdrawal"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Withdrawal Requests</h2>
            {withdrawalRequests.length === 0 ? (
              <p className="text-gray-500">No withdrawal requests yet</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-5 font-medium text-sm text-gray-500 border-b pb-2">
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Bank Account</div>
                  <div>Status</div>
                  <div>Notes</div>
                </div>
                {withdrawalRequests.map((request: WithdrawalRequest) => (
                  <div key={request.id} className="grid grid-cols-5 text-sm py-2 border-b border-gray-100">
                    <div>{format(new Date(request.createdAt), "MMM d, yyyy")}</div>
                    <div>{formatCurrency(request.amount)}</div>
                    <div>{request.bankAccountNumber} ({request.bankName})</div>
                    <div>
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
                    </div>
                    <div>{request.notes || "-"}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="request">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Request Withdrawal</h2>
            <WithdrawalRequestForm currentBalance={wallet?.balance || 0} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

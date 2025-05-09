"use client"

import { useState } from "react"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  CreditCard,
  DollarSign,
  History,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function WalletDashboard() {
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("")
  const [withdrawalType, setWithdrawalType] = useState<string>("fixed")
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [selectedFixedAmount, setSelectedFixedAmount] = useState<string>("100")

  // Mock data - in a real app, this would come from an API
  const walletBalance = 12450.75
  const recentTransactions = [
    {
      id: 1,
      type: "deposit",
      amount: 2500,
      date: "2023-05-01",
      status: "completed",
    },
    {
      id: 2,
      type: "withdrawal",
      amount: 1000,
      date: "2023-04-28",
      status: "completed",
    },
    {
      id: 3,
      type: "withdrawal",
      amount: 500,
      date: "2023-04-15",
      status: "processing",
    },
  ]

  const fixedAmounts = [
    { value: "100", label: "$100" },
    { value: "500", label: "$500" },
    { value: "1000", label: "$1,000" },
    { value: "5000", label: "$5,000" },
  ]

  const handleWithdrawalRequest = () => {
    // In a real app, this would send the request to the backend
    const amount =
      withdrawalType === "fixed" ? selectedFixedAmount : withdrawalAmount
    console.log(`Withdrawal request submitted: $${amount}`)
    setIsDialogOpen(false)

    // Reset form
    setWithdrawalAmount("")
    setWithdrawalType("fixed")
    setSelectedFixedAmount("100")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Agency Finance Portal</h1>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Wallet Balance</CardTitle>
            <CardDescription>Your current available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <Wallet className="h-12 w-12 text-primary mb-4" />
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-primary" />
                <span className="text-4xl font-bold">
                  {walletBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: Today at 3:45 PM
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  Request Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Withdrawal</DialogTitle>
                  <DialogDescription>
                    Submit a withdrawal request to the administrator for
                    processing.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="fixed" onValueChange={setWithdrawalType}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fixed">Fixed Amount</TabsTrigger>
                    <TabsTrigger value="custom">Custom Amount</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fixed" className="py-4">
                    <RadioGroup
                      value={selectedFixedAmount}
                      onValueChange={setSelectedFixedAmount}
                      className="grid grid-cols-2 gap-4"
                    >
                      {fixedAmounts.map((amount) => (
                        <div
                          key={amount.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={amount.value}
                            id={`amount-${amount.value}`}
                          />
                          <Label
                            htmlFor={`amount-${amount.value}`}
                            className="flex h-16 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                          >
                            {amount.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </TabsContent>
                  <TabsContent value="custom" className="py-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Withdrawal Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="amount"
                            placeholder="Enter amount"
                            className="pl-9"
                            type="number"
                            value={withdrawalAmount}
                            onChange={(e) =>
                              setWithdrawalAmount(e.target.value)
                            }
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Available balance: $
                          {walletBalance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleWithdrawalRequest}>
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
            <CardDescription>Your transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    {transaction.type === "deposit" ? (
                      <ArrowUpCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-8 w-8 text-orange-500" />
                    )}
                    <div>
                      <p className="font-medium capitalize">
                        {transaction.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {transaction.type === "deposit" ? "+" : "-"}$
                      {transaction.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      className={`text-sm ${
                        transaction.status === "completed"
                          ? "text-green-500"
                          : "text-amber-500"
                      } capitalize`}
                    >
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <History className="mr-2 h-4 w-4" />
              View All Transactions
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-xl">Withdrawal History</CardTitle>
            <CardDescription>
              Status of your withdrawal requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Request ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">WD-2023-001</td>
                    <td className="px-6 py-4">May 1, 2023</td>
                    <td className="px-6 py-4">$1,500.00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">WD-2023-002</td>
                    <td className="px-6 py-4">April 15, 2023</td>
                    <td className="px-6 py-4">$2,000.00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Processing
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4">WD-2023-003</td>
                    <td className="px-6 py-4">April 5, 2023</td>
                    <td className="px-6 py-4">$500.00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Rejected
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Bank Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">**** 1234</p>
                  <p className="text-sm text-muted-foreground">National Bank</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Credit Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">**** 5678</p>
                  <p className="text-sm text-muted-foreground">
                    Visa ending in 5678
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-center items-center p-6">
            <Button variant="outline" className="w-full">
              <span className="mr-2">+</span> Add Payment Method
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

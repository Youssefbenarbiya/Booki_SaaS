/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { useState, useEffect } from "react"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  CreditCard,
  DollarSign,
  History,
  Wallet,
  Loader2,
  RefreshCw,
  Plus,
  Pencil,
  Trash,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSession } from "@/auth-client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function WalletDashboard() {
  const router = useRouter()
  const session = useSession()
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("")
  const [withdrawalType, setWithdrawalType] = useState<string>("fixed")
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [selectedFixedAmount, setSelectedFixedAmount] = useState<string>("100")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer")
  const [paymentDetails, setPaymentDetails] = useState<string>("")
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    number | null
  >(null)
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] =
    useState<boolean>(false)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "bank_account",
    name: "",
    details: "",
    isDefault: false,
  })
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null)

  // State for wallet data
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([])
  const [incomeSummary, setIncomeSummary] = useState<{
    tripBookings: number
    carBookings: number
    roomBookings: number
    total: number
  }>({
    tripBookings: 0,
    carBookings: 0,
    roomBookings: 0,
    total: 0,
  })
  const [calculations, setCalculations] = useState<any>(null)

  const fixedAmounts = [
    { value: "100", label: "$100" },
    { value: "500", label: "$500" },
    { value: "1000", label: "$1,000" },
    { value: "5000", label: "$5,000" },
  ]

  // Fetch wallet data on component mount
  useEffect(() => {
    if (!session) return

    if (!session.data) {
      toast.error("You must be logged in to view wallet information")
      return
    }

    // Load data sequentially to ensure wallet exists before other calls
    setIsLoading(true)
    fetchWallet()
      .then((walletExists) => {
        if (walletExists) {
          // Only proceed with other API calls if wallet exists
          return Promise.all([
            fetchTransactions(),
            fetchWithdrawalRequests(),
            fetchIncomeSummary(),
          ])
        }
      })
      .catch((error) => {
        console.error("Error loading wallet data:", error)
        toast.error(`Error loading wallet data: ${getErrorMessage(error)}`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [session])

  // Fetch payment methods on component mount
  useEffect(() => {
    if (!session?.data) return
    fetchPaymentMethods()
  }, [session])

  const fetchWallet = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/wallet")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.details || error.error || "Failed to fetch wallet"
        )
      }

      const data = await response.json()
      setWalletBalance(parseFloat(data.wallet.balance))

      // Store calculation details if available
      if (data.calculations) {
        setCalculations(data.calculations)
      }

      return true
    } catch (error) {
      console.error("Error fetching wallet:", error)
      toast.error(`Failed to load wallet data: ${getErrorMessage(error)}`)
      return false
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/wallet/payment-methods")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.details || error.error || "Failed to fetch payment methods"
        )
      }

      const data = await response.json()
      setPaymentMethods(data.paymentMethods)

      // Set default payment method if available
      const defaultMethod = data.paymentMethods.find(
        (method: any) => method.isDefault
      )
      if (defaultMethod) {
        setSelectedPaymentMethodId(defaultMethod.id)
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast.error(`Failed to load payment methods: ${getErrorMessage(error)}`)
    }
  }

  const refreshWalletBalance = async () => {
    setIsRefreshing(true)
    try {
      // Add refresh=true parameter to force recalculating the balance
      const response = await fetch("/api/wallet?refresh=true")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.details || error.error || "Failed to fetch wallet"
        )
      }

      const data = await response.json()
      setWalletBalance(parseFloat(data.wallet.balance))

      // Store calculation details if available
      if (data.calculations) {
        setCalculations(data.calculations)
      }

      await fetchTransactions()
      await fetchIncomeSummary()
      toast.success("Wallet balance updated")
    } catch (error) {
      console.error("Error refreshing wallet balance:", error)
      toast.error(`Failed to refresh wallet balance: ${getErrorMessage(error)}`)
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/wallet/transactions?limit=5")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.details || error.error || "Failed to fetch transactions"
        )
      }

      const data = await response.json()
      setRecentTransactions(
        data.transactions.map((tx: any) => ({
          id: tx.id,
          type: tx.type,
          amount: parseFloat(tx.amount),
          date: new Date(tx.createdAt).toISOString().split("T")[0],
          status: tx.status,
        }))
      )
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error(
        `Failed to load transaction history: ${getErrorMessage(error)}`
      )
    }
  }

  const fetchWithdrawalRequests = async () => {
    try {
      const response = await fetch("/api/wallet/withdraw")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.details || error.error || "Failed to fetch withdrawal requests"
        )
      }

      const data = await response.json()
      setWithdrawalRequests(data.requests)
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error)
      toast.error(
        `Failed to load withdrawal requests: ${getErrorMessage(error)}`
      )
    }
  }

  const fetchIncomeSummary = async () => {
    try {
      const response = await fetch("/api/wallet/income-summary")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.details || error.error || "Failed to fetch income summary"
        )
      }

      const data = await response.json()
      setIncomeSummary(data.summary)
    } catch (error) {
      console.error("Error fetching income summary:", error)
      toast.error(`Failed to load income summary: ${getErrorMessage(error)}`)
    }
  }

  // Get the user ID from the session
  const getUserId = () => {
    if (!session?.data?.user?.id) {
      console.error("No user ID in session")
      return null
    }
    return session.data.user.id
  }

  const handleWithdrawalRequest = async () => {
    try {
      if (!session?.data) {
        toast.error("You must be logged in to make a withdrawal request")
        return
      }

      setIsSubmitting(true)
      const amount =
        withdrawalType === "fixed"
          ? parseFloat(selectedFixedAmount)
          : parseFloat(withdrawalAmount)

      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount")
        return
      }

      if (amount > walletBalance) {
        toast.error("Insufficient balance")
        return
      }

      // Log the payment method and details before sending the request
      console.log("Submitting withdrawal with payment method:", paymentMethod)
      console.log("Payment details:", paymentDetails)

      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          paymentMethod: paymentMethod, // Ensure this is explicitly the selected payment method
          paymentDetails,
          paymentMethodId: selectedPaymentMethodId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to submit withdrawal request"
        )
      }

      toast.success("Withdrawal request submitted successfully")
      setIsDialogOpen(false)

      // Refresh data
      await fetchWallet()
      await fetchWithdrawalRequests()

      // Reset form but don't change the payment method to avoid confusion
      setWithdrawalAmount("")
      setWithdrawalType("fixed")
      setSelectedFixedAmount("100")
      // Don't reset payment method to bank_transfer
      // setPaymentMethod("bank_transfer")
      setPaymentDetails("")
      setSelectedPaymentMethodId(null)
    } catch (error) {
      console.error("Error submitting withdrawal request:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Payment method management functions
  const handleAddPaymentMethod = async () => {
    try {
      setIsSubmitting(true)

      // Basic validation
      if (!newPaymentMethod.name || !newPaymentMethod.details) {
        toast.error("Please fill in all required fields")
        return
      }

      const response = await fetch("/api/wallet/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPaymentMethod),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.details || errorData.error || "Failed to add payment method"
        )
      }

      await fetchPaymentMethods()
      toast.success("Payment method added successfully")
      setIsPaymentMethodDialogOpen(false)
      setNewPaymentMethod({
        type: "bank_account",
        name: "",
        details: "",
        isDefault: false,
      })
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePaymentMethod = async () => {
    try {
      setIsSubmitting(true)

      if (!editingPaymentMethod?.id) {
        toast.error("No payment method selected for editing")
        return
      }

      const response = await fetch(
        `/api/wallet/payment-methods/${editingPaymentMethod.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingPaymentMethod),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to update payment method"
        )
      }

      await fetchPaymentMethods()
      toast.success("Payment method updated successfully")
      setIsPaymentMethodDialogOpen(false)
      setEditingPaymentMethod(null)
    } catch (error) {
      console.error("Error updating payment method:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePaymentMethod = async (id: number) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this payment method?"
      )
      if (!confirmed) return

      const response = await fetch(`/api/wallet/payment-methods/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to delete payment method"
        )
      }

      await fetchPaymentMethods()
      toast.success("Payment method deleted successfully")

      // If we deleted the selected payment method, clear the selection
      if (selectedPaymentMethodId === id) {
        setSelectedPaymentMethodId(null)
      }
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast.error(getErrorMessage(error))
    }
  }

  // Function to handle payment method selection in withdrawal dialog
  const handlePaymentMethodSelect = (id: number) => {
    setSelectedPaymentMethodId(id)
    const selectedMethod = paymentMethods.find((method) => method.id === id)
    if (selectedMethod) {
      // Ensure the payment method is set correctly (bank_transfer or flouci)
      setPaymentMethod(selectedMethod.type)
      setPaymentDetails(selectedMethod.details)
    }
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading wallet information...</span>
      </div>
    )
  }

  if (!session.data) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view your wallet information.
        </p>
        <Button onClick={() => router.push("/login")}>Log In</Button>
      </div>
    )
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
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Wallet Balance</CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshWalletBalance}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            <CardDescription>Your current available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <Wallet className="h-12 w-12 text-primary mb-4" />
              <div className="flex items-center">
                TND{" "}
                <span className="text-4xl font-bold">
                  {walletBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: {new Date().toLocaleString()}
              </p>
              {calculations && (
                <div className="w-full mt-4 text-sm">
                  <p className="font-medium mb-2">Balance calculation:</p>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Earnings:</span>
                      <span>
                        TND
                        {calculations.totalEarnings.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Withdrawals:</span>
                      <span>
                        -TND
                        {calculations.totalWithdrawals.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="border-t pt-1 flex justify-between font-medium">
                      <span>Current Balance:</span>
                      <span>
                        TND
                        {calculations.balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
                          Available balance: TND
                          {walletBalance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    {paymentMethods.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          <RadioGroup
                            value={selectedPaymentMethodId?.toString() || ""}
                            onValueChange={(value) =>
                              handlePaymentMethodSelect(parseInt(value))
                            }
                          >
                            {paymentMethods.map((method) => (
                              <div
                                key={method.id}
                                className="flex items-center space-x-2 border p-3 rounded-md"
                              >
                                <RadioGroupItem
                                  value={method.id.toString()}
                                  id={`method-${method.id}`}
                                />
                                <Label
                                  htmlFor={`method-${method.id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">
                                    {method.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {method.type === "bank_account"
                                      ? "Bank Account"
                                      : "Flouci"}
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setIsPaymentMethodDialogOpen(true)
                              setIsDialogOpen(false) // Close the withdrawal dialog temporarily
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Payment Method
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center p-4 border rounded-md">
                          <p className="mb-4 text-muted-foreground">
                            No payment methods found
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setIsPaymentMethodDialogOpen(true)
                              setIsDialogOpen(false) // Close the withdrawal dialog temporarily
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Payment Method
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Only show manual input if no payment method is selected */}
                  {!selectedPaymentMethodId && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="payment-method-type">
                          Payment Method Type
                        </Label>
                        <Select
                          value={paymentMethod}
                          onValueChange={(value) => {
                            console.log("Selected payment method:", value) // Debug log
                            setPaymentMethod(value)
                            // Clear payment details when changing payment method type
                            setPaymentDetails("")
                          }}
                        >
                          <SelectTrigger id="payment-method-type">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">
                              Bank account
                            </SelectItem>
                            <SelectItem value="flouci">flouci</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="payment-details">Payment Details</Label>
                        <Input
                          id="payment-details"
                          value={paymentDetails}
                          onChange={(e) => setPaymentDetails(e.target.value)}
                          placeholder={
                            paymentMethod === "bank_transfer"
                              ? "Bank Account Details"
                              : "Flouci ID"
                          }
                        />
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWithdrawalRequest}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
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
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      {transaction.type === "deposit" ||
                      transaction.type === "payment" ? (
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
                        {transaction.type === "deposit" ||
                        transaction.type === "payment"
                          ? "+"
                          : "-"}
                        TND
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
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent transactions found
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <History className="mr-2 h-4 w-4" />
              View All Transactions
            </Button>
          </CardFooter>
        </Card>

        {/* Income Summary Card */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Income Summary</CardTitle>
            <CardDescription>Summary of your booking income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Trip Bookings:</span>
                <span className="font-medium">
                  $
                  {incomeSummary.tripBookings.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Car Bookings:</span>
                <span className="font-medium">
                  $
                  {incomeSummary.carBookings.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Room Bookings:</span>
                <span className="font-medium">
                  $
                  {incomeSummary.roomBookings.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-bold">
                  <span>Total Income:</span>
                  <span>
                    $
                    {incomeSummary.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-2">
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
                  {withdrawalRequests.length > 0 ? (
                    withdrawalRequests.map((request) => (
                      <tr key={request.id} className="bg-white border-b">
                        <td className="px-6 py-4">WD-{request.id}</td>
                        <td className="px-6 py-4">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          TND
                          {parseFloat(request.amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-white border-b">
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        No withdrawal requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{method.name}</span>
                    {method.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      {method.type === "bank_account" ? (
                        <Building2 className="h-6 w-6 text-primary" />
                      ) : (
                        <CreditCard className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.type === "bank_account"
                          ? "Bank Account"
                          : "Flouci"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method.details}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingPaymentMethod(method)
                      setIsPaymentMethodDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="flex flex-col justify-center items-center p-6">
              <p className="text-muted-foreground mb-4">
                No payment methods added yet
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsPaymentMethodDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Payment Method
              </Button>
            </Card>
          )}

          {paymentMethods.length > 0 && (
            <Card className="flex flex-col justify-center items-center p-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsPaymentMethodDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Payment Method
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* New Payment Method Dialog */}
      <Dialog
        open={isPaymentMethodDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentMethodDialogOpen(open)
          if (!open) {
            setEditingPaymentMethod(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingPaymentMethod
                ? "Edit Payment Method"
                : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              {editingPaymentMethod
                ? "Update your payment method details"
                : "Add a new payment method for withdrawals"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pm-type">Method Type</Label>
              <Select
                value={
                  editingPaymentMethod
                    ? editingPaymentMethod.type
                    : newPaymentMethod.type
                }
                onValueChange={(value) => {
                  if (editingPaymentMethod) {
                    setEditingPaymentMethod({
                      ...editingPaymentMethod,
                      type: value,
                    })
                  } else {
                    setNewPaymentMethod({ ...newPaymentMethod, type: value })
                  }
                }}
              >
                <SelectTrigger id="pm-type">
                  <SelectValue placeholder="Select method type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_account">Bank Account</SelectItem>
                  <SelectItem value="flouci">Flouci</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pm-name">Name</Label>
              <Input
                id="pm-name"
                placeholder="e.g., My Bank Account"
                value={
                  editingPaymentMethod
                    ? editingPaymentMethod.name
                    : newPaymentMethod.name
                }
                onChange={(e) => {
                  if (editingPaymentMethod) {
                    setEditingPaymentMethod({
                      ...editingPaymentMethod,
                      name: e.target.value,
                    })
                  } else {
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      name: e.target.value,
                    })
                  }
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pm-details">Details</Label>
              <Input
                id="pm-details"
                placeholder={
                  (editingPaymentMethod
                    ? editingPaymentMethod.type
                    : newPaymentMethod.type) === "bank_account"
                    ? "Bank account number or IBAN"
                    : "Flouci ID"
                }
                value={
                  editingPaymentMethod
                    ? editingPaymentMethod.details
                    : newPaymentMethod.details
                }
                onChange={(e) => {
                  if (editingPaymentMethod) {
                    setEditingPaymentMethod({
                      ...editingPaymentMethod,
                      details: e.target.value,
                    })
                  } else {
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      details: e.target.value,
                    })
                  }
                }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pm-default"
                checked={
                  editingPaymentMethod
                    ? editingPaymentMethod.isDefault
                    : newPaymentMethod.isDefault
                }
                onChange={(e) => {
                  if (editingPaymentMethod) {
                    setEditingPaymentMethod({
                      ...editingPaymentMethod,
                      isDefault: e.target.checked,
                    })
                  } else {
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      isDefault: e.target.checked,
                    })
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="pm-default">Set as default payment method</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPaymentMethodDialogOpen(false)
                setEditingPaymentMethod(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingPaymentMethod
                  ? handleUpdatePaymentMethod
                  : handleAddPaymentMethod
              }
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPaymentMethod ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

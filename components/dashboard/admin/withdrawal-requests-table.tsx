/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import {
  Check,
  X,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
  FileText,
  ExternalLink,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type WithdrawalRequest = {
  withdrawalRequest: {
    id: number
    walletId: number
    userId: string
    amount: string
    status: string
    approvedBy: string | null
    approvedAt: string | null
    rejectedBy: string | null
    rejectedAt: string | null
    rejectionReason: string | null
    paymentMethod: string | null
    paymentDetails: string | null
    receiptUrl: string | null
    createdAt: string
    updatedAt: string
  }
  userName: string
  userEmail: string
}

interface WithdrawalRequestsTableProps {
  locale: string
}

export function WithdrawalRequestsTable({
  locale,
}: WithdrawalRequestsTableProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalRequest | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)

  // Fetch withdrawal requests
  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = `/api/admin/withdrawals?limit=${pagination.limit}&offset=${pagination.offset}`

      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`
      }

      // Include locale in API request if needed
      url += `&locale=${locale}`

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch withdrawal requests")
      }

      const data = await response.json()
      setWithdrawals(data.withdrawals)
      setPagination({
        ...pagination,
        total: data.pagination.total,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error fetching withdrawals:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [statusFilter, pagination.offset, pagination.limit])

  // Handle receipt file upload
  const uploadReceipt = async () => {
    if (!receiptFile || !selectedRequest) return null
    
    try {
      setUploadingReceipt(true)
      const formData = new FormData()
      formData.append("receipt", receiptFile)
      formData.append("withdrawalId", selectedRequest.withdrawalRequest.id.toString())
      
      const response = await fetch(`/api/admin/withdrawals/upload-receipt`, {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload receipt")
      }
      
      const data = await response.json()
      return data.receiptUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload receipt")
      console.error("Error uploading receipt:", err)
      return null
    } finally {
      setUploadingReceipt(false)
    }
  }

  // Handle approve withdrawal
  const handleApprove = async () => {
    if (!selectedRequest) return
    
    try {
      // First upload the receipt if provided
      let receiptUrl = null
      if (receiptFile) {
        receiptUrl = await uploadReceipt()
        if (!receiptUrl) {
          return // Don't proceed if receipt upload failed
        }
      }

      const response = await fetch(
        `/api/admin/withdrawals/${selectedRequest.withdrawalRequest.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "approved",
            receiptUrl: receiptUrl,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to approve withdrawal request")
      }

      // Refresh data
      fetchWithdrawals()
      setIsApproveDialogOpen(false)
      setReceiptFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error approving withdrawal:", err)
    }
  }

  // Handle reject withdrawal
  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(
        `/api/admin/withdrawals/${selectedRequest.withdrawalRequest.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "rejected",
            rejectionReason,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reject withdrawal request")
      }

      // Refresh data
      fetchWithdrawals()
      setIsRejectDialogOpen(false)
      setRejectionReason("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error rejecting withdrawal:", err)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <Check className="w-3 h-3 mr-1" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            <X className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter withdrawals by search query
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    return (
      withdrawal.userName.toLowerCase().includes(searchLower) ||
      withdrawal.userEmail.toLowerCase().includes(searchLower) ||
      withdrawal.withdrawalRequest.id.toString().includes(searchLower) ||
      withdrawal.withdrawalRequest.amount.includes(searchQuery)
    )
  })

  // Pagination
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setPagination({
      ...pagination,
      offset: (page - 1) * pagination.limit,
    })
  }

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0])
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>
                Manage agency withdrawal requests
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading withdrawal requests...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8 text-red-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p>{error}</p>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="flex justify-center items-center py-8 text-muted-foreground">
              <p>No withdrawal requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Agency</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Payment Info</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.withdrawalRequest.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">
                        #{withdrawal.withdrawalRequest.id}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{withdrawal.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {withdrawal.userEmail}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        $
                        {Number.parseFloat(
                          withdrawal.withdrawalRequest.amount
                        ).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium capitalize">
                            {withdrawal.withdrawalRequest.paymentMethod === "bank_transfer" 
                              ? "Bank account" 
                              : withdrawal.withdrawalRequest.paymentMethod === "flouci" 
                                ? "Flouci" 
                                : withdrawal.withdrawalRequest.paymentMethod || "Bank account"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={withdrawal.withdrawalRequest.paymentDetails || ""}>
                            {withdrawal.withdrawalRequest.paymentDetails || "No details provided"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(withdrawal.withdrawalRequest.status)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDate(withdrawal.withdrawalRequest.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        {withdrawal.withdrawalRequest.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                              onClick={() => {
                                setSelectedRequest(withdrawal)
                                setIsApproveDialogOpen(true)
                              }}
                            >
                              <Upload className="w-4 h-4 mr-1" /> Upload Receipt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                              onClick={() => {
                                setSelectedRequest(withdrawal)
                                setIsRejectDialogOpen(true)
                              }}
                            >
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(withdrawal)
                              if (
                                withdrawal.withdrawalRequest.status ===
                                "rejected"
                              ) {
                                setRejectionReason(
                                  withdrawal.withdrawalRequest
                                    .rejectionReason || ""
                                )
                                setIsRejectDialogOpen(true)
                              } else {
                                setIsApproveDialogOpen(true)
                              }
                            }}
                          >
                            View Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min(pagination.total, pagination.offset + 1)}-
            {Math.min(pagination.total, pagination.offset + pagination.limit)}{" "}
            of {pagination.total} results
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm mx-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.withdrawalRequest.status === "approved"
                ? "Withdrawal Request Details"
                : "Upload Transaction Receipt"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.withdrawalRequest.status === "approved"
                ? "This withdrawal request has been approved."
                : "Upload a receipt for the bank transaction to approve this withdrawal request."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Agency</Label>
                  <p className="font-medium">{selectedRequest.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.userEmail}
                  </p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">
                    $
                    {Number.parseFloat(
                      selectedRequest.withdrawalRequest.amount
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <p className="capitalize">
                  {selectedRequest.withdrawalRequest.paymentMethod ||
                    "Bank account"}
                </p>
              </div>

              {selectedRequest.withdrawalRequest.paymentDetails && (
                <div>
                  <Label>Payment Details</Label>
                  <p>{selectedRequest.withdrawalRequest.paymentDetails}</p>
                </div>
              )}

              <div>
                <Label>Request Date</Label>
                <p>{formatDate(selectedRequest.withdrawalRequest.createdAt)}</p>
              </div>

              {selectedRequest.withdrawalRequest.status === "approved" && (
                <>
                  <div>
                    <Label>Approved Date</Label>
                    <p>
                      {selectedRequest.withdrawalRequest.approvedAt
                        ? formatDate(selectedRequest.withdrawalRequest.approvedAt)
                        : "N/A"}
                    </p>
                  </div>
                  
                  {selectedRequest.withdrawalRequest.receiptUrl && (
                    <div>
                      <Label>Transaction Receipt</Label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() => window.open(selectedRequest.withdrawalRequest.receiptUrl!, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Receipt
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedRequest.withdrawalRequest.status === "pending" && (
                <div>
                  <Label htmlFor="receipt">Transaction Receipt</Label>
                  <div className="mt-1">
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a receipt of the bank transaction. Accepted formats: images, PDF
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false)
                setReceiptFile(null)
              }}
            >
              {selectedRequest?.withdrawalRequest.status === "approved"
                ? "Close"
                : "Cancel"}
            </Button>
            {selectedRequest?.withdrawalRequest.status === "pending" && (
              <Button
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!receiptFile || uploadingReceipt}
              >
                {uploadingReceipt ? (
                  "Uploading..."
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Approve with Receipt
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.withdrawalRequest.status === "rejected"
                ? "Withdrawal Request Details"
                : "Reject Withdrawal Request"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.withdrawalRequest.status === "rejected"
                ? "This withdrawal request has been rejected."
                : "Please provide a reason for rejecting this withdrawal request."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Agency</Label>
                  <p className="font-medium">{selectedRequest.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.userEmail}
                  </p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">
                    $
                    {Number.parseFloat(
                      selectedRequest.withdrawalRequest.amount
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <Label>Request Date</Label>
                <p>{formatDate(selectedRequest.withdrawalRequest.createdAt)}</p>
              </div>

              {selectedRequest.withdrawalRequest.status === "rejected" ? (
                <div>
                  <Label>Rejection Reason</Label>
                  <p>{rejectionReason || "No reason provided"}</p>

                  <div className="mt-2">
                    <Label>Rejected Date</Label>
                    <p>
                      {selectedRequest.withdrawalRequest.rejectedAt
                        ? formatDate(
                            selectedRequest.withdrawalRequest.rejectedAt
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Enter reason for rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              {selectedRequest?.withdrawalRequest.status === "rejected"
                ? "Close"
                : "Cancel"}
            </Button>
            {selectedRequest?.withdrawalRequest.status === "pending" && (
              <Button
                onClick={handleReject}
                variant="destructive"
                disabled={!rejectionReason.trim()}
              >
                <X className="w-4 h-4 mr-1" /> Reject Withdrawal
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

interface Transaction {
  id: string
  amount: number
  status: "completed" | "pending" | "failed"
  email: string
  name: string
  type: "car" | "trip" | "hotel"
  date: string
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/admin/transactions', {
          credentials: 'include', // Include cookies for authentication
        })
        const result = await response.json()
        // Check if result has the expected data property
        if (result && result.data) {
          setTransactions(result.data)
        } else {
          console.error("Invalid response format:", result)
          setTransactions(sampleTransactions)
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
        // Use sample data if API call fails
        setTransactions(sampleTransactions)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No recent transactions</p>
      ) : (
        transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://avatar.vercel.sh/${transaction.email}`} alt={transaction.name} />
              <AvatarFallback>{transaction.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{transaction.name}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Booking
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className={`text-sm font-medium ${
                transaction.status === "completed" 
                  ? "text-green-500" 
                  : transaction.status === "failed" 
                    ? "text-red-500" 
                    : "text-yellow-500"
              }`}>
                ${transaction.amount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Sample data in case the API call fails
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    amount: 350,
    status: "completed",
    email: "olivia@example.com",
    name: "Olivia Davis",
    type: "car",
    date: "2023-10-15T10:00:00Z",
  },
  {
    id: "2",
    amount: 450,
    status: "completed",
    email: "jackson@example.com",
    name: "Jackson Smith",
    type: "trip",
    date: "2023-10-14T14:30:00Z",
  },
  {
    id: "3",
    amount: 550,
    status: "pending",
    email: "emma@example.com",
    name: "Emma Johnson",
    type: "hotel",
    date: "2023-10-14T09:15:00Z",
  },
  {
    id: "4",
    amount: 290,
    status: "failed",
    email: "michael@example.com",
    name: "Michael Brown",
    type: "car",
    date: "2023-10-13T16:45:00Z",
  },
  {
    id: "5",
    amount: 1200,
    status: "completed",
    email: "sophia@example.com",
    name: "Sophia Williams",
    type: "trip",
    date: "2023-10-12T11:20:00Z",
  },
] 
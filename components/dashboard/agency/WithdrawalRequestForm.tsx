"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createWithdrawalRequest } from "@/actions/agency/walletActions"

const withdrawalSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Amount must be a valid number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  bankName: z.string().min(2, { message: "Bank name is required" }),
  accountHolderName: z.string().min(2, { message: "Account holder name is required" }),
  bankAccountNumber: z.string().min(5, { message: "Account number is required" }),
  notes: z.string().optional(),
})

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>

export function WithdrawalRequestForm({ currentBalance }: { currentBalance: number | string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const balanceAmount = typeof currentBalance === 'string' ? Number(currentBalance) : currentBalance

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      bankName: "",
      accountHolderName: "",
      bankAccountNumber: "",
      notes: "",
    },
  })

  async function onSubmit(data: WithdrawalFormValues) {
    try {
      setIsSubmitting(true)
      const amount = Number(data.amount)
      
      if (amount > balanceAmount) {
        toast.error("Withdrawal amount cannot exceed your current balance")
        return
      }
      
      const result = await createWithdrawalRequest({
        amount,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        bankAccountNumber: data.bankAccountNumber,
        notes: data.notes || "",
      })
      
      if (result.success) {
        toast.success("Withdrawal request submitted successfully")
        form.reset()
      } else {
        toast.error(result.error || "Failed to submit withdrawal request")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (TND)</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
              </FormControl>
              <FormDescription>
                Available balance: {balanceAmount.toFixed(2)} TND
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter bank name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="accountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter account holder name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankAccountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information (optional)" 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Withdrawal Request"}
        </Button>
      </form>
    </Form>
  )
} 
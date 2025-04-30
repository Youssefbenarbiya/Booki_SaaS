/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { addEmployee } from "@/actions/agency/add-employee"
import { Loader2 } from "lucide-react"
import { EmployeesList } from "./employees-list"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/auth-client"

// Define the expected response type from addEmployee
interface AddEmployeeResponse {
  error?: string;
  success?: boolean;
}

// Validation schema
const employeeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

export default function EmployeesPage() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const session = useSession()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      window.location.reload();
    }
    setOpen(open);
  };

  // Initialize form
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  // Handle form submission
  const onSubmit = useCallback(
    async (data: EmployeeFormValues) => {
      setIsSubmitting(true)
      console.log("Submitting form with data:", data)

      try {
        const result = await addEmployee(data) as AddEmployeeResponse
        console.log("Add employee result:", result)

        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success(
            "Employee added successfully! Login credentials have been emailed."
          )
          form.reset()
          setOpen(false)
          window.location.reload();
        }
      } catch (error) {
        console.error("Error in onSubmit:", error)
        toast.error("An unexpected error occurred. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [form]
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees Management</h1>

        <Button onClick={() => setOpen(true)}>Add New Employee</Button>

        <AlertDialog open={open} onOpenChange={handleOpenChange}>
          <AlertDialogContent className="sm:max-w-[500px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Employee</AlertDialogTitle>
              <AlertDialogDescription>
                Create an employee account. The employee will receive their
                login credentials via email.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="employee@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Login credentials will be sent to this email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="123 Main St, City, Country"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add Employee
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Agency Employees</CardTitle>
          <CardDescription>
            Manage your team members and their access to the agency dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeesList key={refreshKey} />
        </CardContent>
      </Card>
    </div>
  )
}

// filepath: d:\booki\app\agency\dashboard\employees\employees-list.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getEmployeesList } from "@/actions/agency/get-employees"
import { updateEmployee, deleteEmployee } from "@/actions/agency/manage-employees"
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Employee = {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  address: string | null
  image: string | null
  createdAt: Date | null
}

// Validation schema
const employeeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true)
      try {
        console.log("Fetching employees...")
        const result = await getEmployeesList()
        console.log("Fetch result:", result)

        if (result.error) {
          toast.error(result.error)
        } else if (result.employees) {
          console.log("Setting employees:", result.employees)
          setEmployees(result.employees)
        }
      } catch (error) {
        console.error("Failed to load employees:", error)
        toast.error("Failed to load employees")
      } finally {
        setLoading(false)
      }
    }

    loadEmployees()
  }, []) // The key from parent will force remount when needed

  // Handle opening the edit dialog
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    form.reset({
      name: employee.name,
      email: employee.email,
      phone: employee.phoneNumber || "",
      address: employee.address || "",
    })
    setEditDialogOpen(true)
  }

  // Handle opening the delete dialog
  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteDialogOpen(true)
  }

  // Handle form submission for editing employee
  const onSubmit = async (data: EmployeeFormValues) => {
    if (!selectedEmployee) return
    
    setIsSubmitting(true)
    try {
      const result = await updateEmployee(selectedEmployee.id, data)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Employee updated successfully")
        setEditDialogOpen(false)
        
        // Update the employee in the local state
        setEmployees(prev => 
          prev.map(emp => 
            emp.id === selectedEmployee.id 
              ? { 
                  ...emp, 
                  name: data.name, 
                  email: data.email, 
                  phoneNumber: data.phone || null,
                  address: data.address || null
                } 
              : emp
          )
        )
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      toast.error("Failed to update employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting employee
  const handleDelete = async () => {
    if (!selectedEmployee) return
    
    setIsSubmitting(true)
    try {
      const result = await deleteEmployee(selectedEmployee.id)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Employee removed successfully")
        setDeleteDialogOpen(false)
        
        // Remove employee from the local state
        setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id))
      }
    } catch (error) {
      console.error("Error removing employee:", error)
      toast.error("Failed to remove employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleEditOpenChange = (open: boolean) => {
    if (!open) {
      window.location.reload();
    }
    setEditDialogOpen(open);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) {
      window.location.reload();
    }
    setDeleteDialogOpen(open);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading employees...</div>
  }

  if (employees.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/10">
        <p className="mb-2 text-muted-foreground">No employees found</p>
        <p className="text-sm text-muted-foreground">
          Add employees to your agency to see them here.
        </p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {employee.image ? (
                      <AvatarImage src={employee.image} alt={employee.name} />
                    ) : null}
                    <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <span>{employee.name}</span>
                </div>
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.phoneNumber || "—"}</TableCell>
              <TableCell>
                {employee.createdAt
                  ? new Date(employee.createdAt).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(employee)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Employee Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={handleEditOpenChange}>
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Update employee information
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
                    Save Changes
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedEmployee?.name} from your agency?
              Their account will remain active but they will no longer have access to your agency dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Employee"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

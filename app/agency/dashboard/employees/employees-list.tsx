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
import { toast } from "sonner"

type Employee = {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  image: string | null
  createdAt: Date | null
}

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

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

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

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
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

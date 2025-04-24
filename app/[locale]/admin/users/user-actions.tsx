"use client"

import { useRouter, useParams } from "next/navigation"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Ban, Shield, Trash2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  banUser,
  unbanUser,
  setUserRole,
  deleteUser,
} from "@/actions/users/manageUsersActions"
import type { User } from "./columns"

export function UserActions({ user }: { user: User }) {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const locale = params.locale as string

  const handleBanUser = async () => {
    if (!confirm(`Are you sure you want to ban ${user.name}?`)) return;
    
    try {
      await banUser(user.id)
      toast({
        title: "User banned",
        description: "The user has been banned successfully",
      })
      router.refresh()
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to ban the user. Please try again.",
      })
    }
  }

  const handleUnbanUser = async () => {
    try {
      await unbanUser(user.id)
      toast({
        title: "User unbanned",
        description: "The user has been unbanned successfully",
      })
      router.refresh()
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to unban the user. Please try again.",
      })
    }
  }

  const handleSetRole = async (role: string) => {
    if (!confirm(`Are you sure you want to change ${user.name}'s role to ${role}?`)) return;
    
    try {
      await setUserRole(user.id, role)
      toast({
        title: "Role updated",
        description: `User is now a ${role}`,
      })
      router.refresh()
    } catch (error) {
      console.error("Error setting user role:", error)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to update user role. Please try again.",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`)) return;
    
    try {
      await deleteUser(user.id)
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted",
        variant: "destructive",
      })
      router.refresh()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to delete the user. Please try again.",
      })
    }
  }

  return (
    <>
      {user.banned ? (
        <DropdownMenuItem onClick={handleUnbanUser}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Unban User
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem onClick={handleBanUser}>
          <Ban className="mr-2 h-4 w-4" />
          Ban User
        </DropdownMenuItem>
      )}

      {/* Role management */}
      {user.role !== "admin" && (
        <DropdownMenuItem onClick={() => handleSetRole("admin")}>
          <Shield className="mr-2 h-4 w-4" />
          Make Admin
        </DropdownMenuItem>
      )}
      {user.role !== "agency" && (
        <DropdownMenuItem onClick={() => handleSetRole("agency")}>
          <Shield className="mr-2 h-4 w-4" />
          Make Agency
        </DropdownMenuItem>
      )}
      {user.role !== "customer" && (
        <DropdownMenuItem onClick={() => handleSetRole("customer")}>
          <Shield className="mr-2 h-4 w-4" />
          Make Customer
        </DropdownMenuItem>
      )}

      {/* Delete user */}
      <DropdownMenuItem
        onClick={handleDeleteUser}
        className="text-red-600"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete User
      </DropdownMenuItem>
    </>
  )
} 
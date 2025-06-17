/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Ban, Shield, Trash2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

  // State for alert dialogs
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBanUser = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await banUser(user.id)
      setIsBanDialogOpen(false)
      toast({
        title: "User banned",
        description: "The user has been banned successfully",
      })
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to ban the user. Please try again.",
      })
      setIsBanDialogOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnbanUser = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await unbanUser(user.id)
      toast({
        title: "User unbanned",
        description: "The user has been unbanned successfully",
      })
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to unban the user. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSetRole = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await setUserRole(user.id, selectedRole)
      setIsRoleDialogOpen(false)
      toast({
        title: "Role updated",
        description: `User is now a ${selectedRole}`,
      })
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Error setting user role:", error)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to update user role. Please try again.",
      })
      setIsRoleDialogOpen(false)
    } finally {
      setIsProcessing(false)
      setSelectedRole("")
    }
  }

  const handleDeleteUser = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await deleteUser(user.id)
      setIsDeleteDialogOpen(false)
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted",
        variant: "destructive",
      })
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to delete the user. Please try again.",
      })
      setIsDeleteDialogOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const openRoleDialog = (role: string) => {
    setSelectedRole(role)
    setIsRoleDialogOpen(true)
  }

  return (
    <>
      {user.banned ? (
        <DropdownMenuItem onClick={handleUnbanUser} disabled={isProcessing}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Unban User
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem onClick={() => setIsBanDialogOpen(true)} disabled={isProcessing}>
          <Ban className="mr-2 h-4 w-4" />
          Ban User
        </DropdownMenuItem>
      )}

      {/* Role management */}
      {user.role !== "admin" && (
        <DropdownMenuItem onClick={() => openRoleDialog("admin")} disabled={isProcessing}>
          <Shield className="mr-2 h-4 w-4" />
          Make Admin
        </DropdownMenuItem>
      )}
      {/* {user.role !== "agency" && (
        <DropdownMenuItem onClick={() => openRoleDialog("agency")} disabled={isProcessing}>
          <Shield className="mr-2 h-4 w-4" />
          Make Agency
        </DropdownMenuItem>
      )} */}
      {user.role !== "customer" && (
        <DropdownMenuItem onClick={() => openRoleDialog("customer")} disabled={isProcessing}>
          <Shield className="mr-2 h-4 w-4" />
          Make Customer
        </DropdownMenuItem>
      )}

      {/* Delete user */}
      <DropdownMenuItem
        onClick={() => setIsDeleteDialogOpen(true)}
        className="text-red-600"
        disabled={isProcessing}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete User
      </DropdownMenuItem>

      {/* Ban user confirmation dialog */}
      <AlertDialog 
        open={isBanDialogOpen} 
        onOpenChange={(open) => {
          if (!open && !isProcessing) setIsBanDialogOpen(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban {user.name}? They will lose access to
              their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => !isProcessing && setIsBanDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change role confirmation dialog */}
      <AlertDialog 
        open={isRoleDialogOpen} 
        onOpenChange={(open) => {
          if (!open && !isProcessing) {
            setIsRoleDialogOpen(false)
            setSelectedRole("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {user.name}&apos;s role to{" "}
              {selectedRole}? This will modify their permissions in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => !isProcessing && setIsRoleDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSetRole}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Change Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete user confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isProcessing) setIsDeleteDialogOpen(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {user.name}? This
              action cannot be undone and all user data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => !isProcessing && setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

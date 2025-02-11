"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Ban, Shield, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { banUser, unbanUser, setUserRole, deleteUser } from "./actions"
import type { User } from "./columns"

export function UserActions({ user }: { user: User }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      switch (action) {
        case "ban":
          await banUser(user.id)
          toast({
            title: "Success",
            description: "User banned successfully",
          })
          break
        case "unban":
          await unbanUser(user.id)
          toast({
            title: "Success",
            description: "User unbanned successfully",
          })
          break
        case "makeAdmin":
          await setUserRole(user.id, "admin")
          toast({
            title: "Success",
            description: "User made admin successfully",
          })
          break
        case "removeAdmin":
          await setUserRole(user.id, "user")
          toast({
            title: "Success",
            description: "Admin role removed successfully",
          })
          break
        case "delete":
          await deleteUser(user.id)
          toast({
            title: "Success",
            description: "User deleted successfully",
          })
          break
      }
      router.refresh()
    } catch (error) {
      console.error("Error performing user action:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to perform action",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {user.banned ? (
        <DropdownMenuItem
          onClick={() => handleAction("unban")}
          disabled={isLoading}
        >
          <Ban className="mr-2 h-4 w-4" />
          Unban User
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          onClick={() => handleAction("ban")}
          disabled={isLoading}
        >
          <Ban className="mr-2 h-4 w-4" />
          Ban User
        </DropdownMenuItem>
      )}
      {user.role === "admin" ? (
        <DropdownMenuItem
          onClick={() => handleAction("removeAdmin")}
          disabled={isLoading}
        >
          <Shield className="mr-2 h-4 w-4" />
          Remove Admin
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          onClick={() => handleAction("makeAdmin")}
          disabled={isLoading}
        >
          <Shield className="mr-2 h-4 w-4" />
          Make Admin
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        onClick={() => handleAction("delete")}
        disabled={isLoading}
        className="text-red-600"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete User
      </DropdownMenuItem>
    </>
  )
}

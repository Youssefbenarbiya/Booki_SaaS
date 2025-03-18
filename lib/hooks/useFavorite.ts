"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useSession } from "@/auth-client"
import { checkFavoriteStatus, toggleFavorite } from "@/actions/users/favorites"

type ItemType = "car" | "hotel" | "trip"

export function useFavorite(itemId: string | number, itemType: ItemType) {
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const session = useSession()

  // Check if the item is favorited on component mount
  useEffect(() => {
    async function fetchFavoriteStatus() {
      if (!session.data?.user) {
        setIsLoading(false)
        return
      }

      try {
        const result = await checkFavoriteStatus(itemId, itemType)
        setIsFavorite(result.isFavorite)
      } catch (error) {
        console.error("Error checking favorite status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavoriteStatus()
  }, [itemId, itemType, session.data?.user])

  const handleToggleFavorite = async () => {
    if (!session.data?.user) {
      toast.error("Please login to add favorites")
      return
    }

    setIsLoading(true)

    try {
      const result = await toggleFavorite(itemId, itemType)

      if (result.success) {
        const newStatus = result.isFavorite ?? false
        setIsFavorite(newStatus)

        if (newStatus) {
          toast.success("Added to favorites")
        } else {
          toast.success("Removed from favorites")
        }
      } else {
        toast.error(result.error || "Failed to update favorites")
      }
    } catch (error) {
      console.error("Error updating favorite:", error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return { isFavorite, toggleFavorite: handleToggleFavorite, isLoading }
}

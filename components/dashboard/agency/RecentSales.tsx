import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { HotelIcon, Plane, Car } from "lucide-react"

interface Sale {
  id: string
  name: string
  email: string
  amount: number
  date: Date
  avatar?: string | null
  type?: string
}

export function RecentSales({ sales }: { sales: Sale[] }) {
  // Function to get icon based on booking type
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "room":
        return <HotelIcon className="h-3 w-3 text-amber-600" />
      case "trip":
        return <Plane className="h-3 w-3 text-blue-600" />
      case "car":
        return <Car className="h-3 w-3 text-green-600" />
      default:
        return null
    }
  }

  // Function to get badge color based on booking type
  const getTypeBadgeClass = (type?: string) => {
    switch (type) {
      case "room":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "trip":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "car":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {sales.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9 mr-3">
            <AvatarImage src={sale.avatar || undefined} alt={sale.name} />
            <AvatarFallback>
              {sale.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{sale.name}</p>
              {sale.type && (
                <Badge
                  variant="outline"
                  className={`text-xs py-0 h-5 px-1.5 flex items-center gap-0.5 ${getTypeBadgeClass(
                    sale.type
                  )}`}
                >
                  {getTypeIcon(sale.type)}
                  <span className="ml-0.5 capitalize">{sale.type}</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{sale.email}</p>
          </div>
          <div className="font-medium">{formatPrice(sale.amount)}</div>
        </div>
      ))}
    </div>
  )
}

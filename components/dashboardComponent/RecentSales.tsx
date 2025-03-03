import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice } from "@/lib/utils"

interface Sale {
  id: string
  name: string
  email: string
  amount: number
  date: Date
  avatar?: string | null
}

interface RecentSalesProps {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={`${sale.id}-${sale.date.getTime()}`} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={sale.avatar || ""}
              alt={`${sale.name}'s avatar`}
            />
            <AvatarFallback>
              {sale.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">{formatPrice(sale.amount)}</div>
        </div>
      ))}
    </div>
  )
}

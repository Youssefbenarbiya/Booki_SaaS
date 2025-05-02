"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AgencyInfoProps {
  agencyName: string
  agencyLogo?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
  showContactButton?: boolean
  locale: string
}

export default function AgencyInfo({
  agencyName,
  agencyLogo,
  className,
  size = "md",
}: AgencyInfoProps) {
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar className={avatarSizes[size]}>
        {agencyLogo ? <AvatarImage src={agencyLogo} alt={agencyName} /> : null}
        <AvatarFallback>
          {agencyName.charAt(0)}
          {agencyName.split(" ")[1]?.charAt(0) || ""}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className={cn("font-medium", textSizes[size])}>
          {agencyName || "Agency"}
        </p>
        <p
          className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-xs" : size === "md" ? "text-xs" : "text-sm"
          )}
        >
          Verified Agency
        </p>
      </div>
    </div>
  )
}

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface AgencyInfoProps {
  agencyName: string
  agencyLogo?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
  showContactButton?: boolean
  locale: string
  isVerified?: boolean
}

export default function AgencyInfo({
  agencyName,
  agencyLogo,
  className,
  size = "md",
  isVerified = false,
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
        <div
          className={cn(
            "flex items-center gap-1",
            size === "sm" ? "text-xs" : size === "md" ? "text-xs" : "text-sm"
          )}
        >
          {isVerified ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                Verified Agency
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-red-600 dark:text-red-400">
                Unverified Agency
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

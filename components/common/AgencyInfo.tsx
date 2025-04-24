"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgencyInfoProps {
  agencyName: string;
  agencyLogo?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  showContactButton?: boolean;
  locale: string;
}

export default function AgencyInfo({
  agencyName,
  agencyLogo,
  className,
  size = "md",
  showContactButton = true,
  locale,
}: AgencyInfoProps) {
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

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
      {showContactButton && (
        <Button
          variant="outline"
          size="sm"
          className="ml-auto text-orange-500 border-orange-500 hover:bg-orange-50 hover:text-orange-600"
        >
          <Link href={`/${locale}/contact`}>Contact</Link>
        </Button>
      )}
    </div>
  );
}

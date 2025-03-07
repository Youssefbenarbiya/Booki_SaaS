"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type React from "react"

export function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={cn(
        "text-foreground hover:underline text-sm font-medium transition-all",
        pathname === href && "underline"
      )}
    >
      {children}
    </Link>
  )
}

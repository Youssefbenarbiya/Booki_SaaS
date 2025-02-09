"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Plane, Hotel, Users, Settings, LogOut } from "lucide-react"

const navItems = [
  { name: "Home", href: "/admin/dashboard", icon: Home },
  { name: "Trips", href: "/admin/dashboard/trips", icon: Plane },
  { name: "Hotels", href: "/admin/dashboard/hotels", icon: Hotel },
  { name: "Users", href: "/admin/dashboard/users", icon: Users },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-orange-600">Admin Dashboard</h2>
      </div>
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-orange-100 text-orange-600"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 mt-auto">
        <Button variant="outline" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  )
}

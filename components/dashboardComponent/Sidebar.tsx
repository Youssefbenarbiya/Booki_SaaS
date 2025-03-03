"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Plane, Hotel, Users, BookOpen, LogOut, Car } from "lucide-react"

const navItems = [
  { name: "Home", href: "/admin/dashboard", icon: Home },
  { name: "Trips", href: "/admin/dashboard/trips", icon: Plane },
  { name: "Hotels", href: "/admin/dashboard/hotels", icon: Hotel },
  { name: "Users", href: "/admin/dashboard/users", icon: Users },
  { name: "Blogs", href: "/admin/dashboard/blogs", icon: BookOpen },
  { name: "cars", href: "/admin/dashboard/cars", icon: Car },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-background border-r border-border">
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-primary">Admin Dashboard</h2>
      </div>
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-foreground hover:bg-muted",
                  pathname === item.href && "bg-accent text-accent-foreground"
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

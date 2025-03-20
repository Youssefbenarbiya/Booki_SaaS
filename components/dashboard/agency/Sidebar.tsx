"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Building2,
  Car,
  Globe,
  LayoutDashboard,
  PlaneTakeoff,
  BookOpen,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/agency/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Trips",
    href: "/agency/dashboard/trips",
    icon: PlaneTakeoff,
  },
  {
    name: "Hotels",
    href: "/agency/dashboard/hotels",
    icon: Building2,
  },
  {
    name: "Cars",
    href: "/agency/dashboard/cars",
    icon: Car,
  },
  {
    name: "Blogs",
    href: "/agency/dashboard/blogs",
    icon: BookOpen,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white">Travel Agency</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

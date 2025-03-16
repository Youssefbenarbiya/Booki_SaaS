"use client"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  User,
  Heart,
  Clock,
  LogOut,
  Phone,
  Mail,
} from "lucide-react"
import { usePathname } from "next/navigation"

interface UserProfile {
  name?: string
  email?: string
  phoneNumber?: string
  role?: string
  image?: string
}

interface SidebarProps {
  user: UserProfile
}

export function Sidebar({ user }: SidebarProps) {
  const name = user.name || "Guest"
  const email = user.email || "No email provided"
  const phone = user.phoneNumber || "No phone number"
  const role = user.role || "Client"
  const profileImage = user.image || "/placeholder.svg?height=60&width=60"

  const menuItems = [
    {
      id: "dashboard",
      label: "dashboard",
      href: "/user/profile/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "personal-info",
      label: "Personnel Information",
      href: "/user/profile/personal-info",
      icon: User,
    },
    {
      id: "favorites",
      label: "Mes favoris",
      href: "/user/profile/favorites",
      icon: Heart,
    },
 
    {
      id: "history",
      label: "History ",
      href: "/user/profile/bookingHistory",
      icon: Clock,
    },
    {
      id: "logout",
      label: "logout",
      href: "/profile/logout",
      icon: LogOut,
    },
  ]

  const pathname = usePathname()

  return (
    <aside className="w-[280px] bg-white p-4 border-r border-gray-100 overflow-y-auto">
      {/* Profile Section */}
      <div className="mb-4 bg-white rounded-lg border border-gray-100 p-3">
        <div className="flex items-center space-x-3">
          <Image
            src={profileImage}
            alt={`${name}'s profile`}
            width={60}
            height={60}
            className="rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-center text-xs text-gray-600">
            <Phone size={12} className="text-gray-500 mr-1" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Mail size={12} className="text-gray-500 mr-1" />
            <span>{email}</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="text-xs font-medium mb-2 text-gray-800">Générale</h3>
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm text-gray-600 transition-colors ${
                      isActive ? "bg-gray-300" : "hover:bg-gray-300"
                    }`}
                  >
                    <item.icon size={16} className="text-gray-500" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

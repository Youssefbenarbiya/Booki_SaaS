import Link from "next/link"
import type { ReactNode } from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  User,
  Heart,
  PlusCircle,
  BarChartHorizontal,
  Clock,
  HelpCircle,
  LogOut,
  Phone,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { headers } from "next/headers"
import { auth } from "@/auth"
interface UserProfile {
  name?: string
  email?: string
  phoneNumber?: string
  role?: string
  image?: string
}

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode
}) {
const session = await auth.api.getSession({
  headers: await headers(),
})
  const user: UserProfile = session?.user || {}
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
      id: "services",
      label: "Ajouter mon service",
      href: "/user/profile/services",
      icon: PlusCircle,
    },
    {
      id: "compare",
      label: "Compare",
      href: "/user/profile/compare",
      icon: BarChartHorizontal,
    },
    {
      id: "history",
      label: "History ",
      href: "/user/profile/bookingHistory",
      icon: Clock,
    },
    {
      id: "assistance",
      label: "Assistance rapide",
      href: "/profile/quick-assistance",
      icon: HelpCircle,
    },
    {
      id: "logout",
      label: "Déconnexion",
      href: "/profile/logout",
      icon: LogOut,
    },
  ]

  const pathname = (await headers()).get("x-pathname") || ""
  const activeItem =
    menuItems.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    )?.id || "dashboard"

  return (
    <div className="flex">
      <aside className="w-[280px] bg-white p-4 border-r border-gray-100 overflow-y-auto">
        {/* Profile Section */}
        <div className="mb-4 bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center space-x-3">
            <Image
              src={profileImage || "/placeholder.svg"}
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
        <div>
          <h3 className="text-xs font-medium mb-2 text-gray-800">Générale</h3>
          <nav>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 py-2 px-3 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors",
                      activeItem === item.id && "bg-gray-100"
                    )}
                  >
                    <item.icon size={16} className="text-gray-500" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-4 overflow-y-auto">{children}</main>
    </div>
  )
}

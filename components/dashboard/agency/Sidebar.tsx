"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Building2,
  Car,
  LayoutDashboard,
  Mail,
  PlaneTakeoff,
  BookOpen,
  Users,
  CalendarCheck,
  UserCircle,
  MessageCircle,
} from "lucide-react"
import { useSession } from "@/auth-client"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { getAgencyProfile } from "@/actions/agency/agencyActions"
import { Skeleton } from "@/components/ui/skeleton"
import { Locale } from "@/i18n/routing"

interface SidebarProps {
  locale: Locale
}

export function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname()
  const session = useSession()
  const userRole = session.data?.user?.role
  const [agencyData, setAgencyData] = useState<{
    name?: string
    email?: string
    logo?: string
    agencyType?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Create navigation items with locale
  const navigation = [
    {
      name: "Dashboard",
      href: `/${locale}/agency/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: "Trips",
      href: `/${locale}/agency/dashboard/trips`,
      icon: PlaneTakeoff,
      hideFor: ["car_rental"],
    },
    {
      name: "Hotels",
      href: `/${locale}/agency/dashboard/hotels`,
      icon: Building2,
      hideFor: ["car_rental"],
    },
    {
      name: "Cars",
      href: `/${locale}/agency/dashboard/cars`,
      icon: Car,
      hideFor: ["travel"],
    },
    {
      name: "Blogs",
      href: `/${locale}/agency/dashboard/blogs`,
      icon: BookOpen,
    },
    {
      name: "Employees",
      href: `/${locale}/agency/dashboard/employees`,
      icon: Users,
    },
    {
      name: "Bookings",
      href: `/${locale}/agency/dashboard/bookings`,
      icon: CalendarCheck,
    },
    {
      name: "Messages",
      href: `/${locale}/agency/dashboard/messages`,
      icon: MessageCircle,
    },
  ]

  // Fetch agency data
  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        const response = await getAgencyProfile()
        if (response.agency) {
          setAgencyData({
            name: response.agency.agencyName || "Agency",
            email:
              response.agency.contactEmail || session.data?.user?.email || "",
            logo: response.agency.logo || "",
            agencyType: response.agency.agencyType || "",
          })
        } else {
          // Fallback to user email if no agency found
          setAgencyData({
            name: "Agency",
            email: session.data?.user?.email || "",
            logo: "",
          })
        }
      } catch (error) {
        console.error("Error fetching agency data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgencyData()
  }, [session.data?.user?.email])

  // Filter navigation based on both user role and agency type
  const filteredNavigation = navigation.filter((item) => {
    // First filter by role
    if (userRole === "employee" && item.name === "Employees") {
      return false
    }

    // Then filter by agency type
    if (
      agencyData?.agencyType &&
      item.hideFor &&
      item.hideFor.includes(agencyData.agencyType)
    ) {
      return false
    }

    return true
  })

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        {/* Agency Profile Section */}
        <div className="py-6">
          <div className="flex items-center justify-center mb-4">
            {isLoading ? (
              <Skeleton className="h-16 w-16 rounded-full bg-gray-800" />
            ) : agencyData?.logo ? (
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image
                  src={agencyData.logo}
                  alt={agencyData.name || "Agency Logo"}
                  fill
                  sizes="4rem"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full overflow-hidden relative bg-gray-800">
                <Image
                  src="/images/default-logo.png"
                  alt="Default Agency Logo"
                  fill
                  sizes="4rem"
                  className="object-cover"
                  onError={(e) => {
                    // Hide the image on error
                    e.currentTarget.style.display = "none"
                    // Show the fallback icon
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div class="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-white">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </svg>
                        </div>
                      `
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="text-center">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-36 mx-auto mb-2 bg-gray-800" />
                <Skeleton className="h-5 w-48 mx-auto bg-gray-800" />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white">
                  {agencyData?.name}
                </h2>
                <div className="flex items-center justify-center mt-2 text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{agencyData?.email}</span>
                </div>
              </>
            )}
            <div className="mt-3">
              <Link
                href={`/${locale}/agency/profile`}
                className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center justify-center"
              >
                <UserCircle className="h-4 w-4 mr-1" />
                View Profile
              </Link>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-800" />

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {filteredNavigation.map((item) => {
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

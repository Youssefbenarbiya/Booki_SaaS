"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"



export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
      ? "bg-gray-900 text-white"
      : "text-gray-300 hover:bg-gray-700"
  }

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
        <span className="text-xl font-bold text-white">Admin Panel</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link
          href="/admin"
          className={`flex items-center px-4 py-2 rounded-md ${isActive(
            "/admin"
          )}`}
        >
          <span>Dashboard</span>
        </Link>
        <Link
          href="/admin/verify-offers"
          className={`flex items-center px-4 py-2 rounded-md ${isActive(
            "/admin/verify-offers"
          )}`}
        >
          <span>Verify Offers</span>
        </Link>
        <Link
          href="/admin/agencies"
          className={`flex items-center px-4 py-2 rounded-md ${isActive(
            "/admin/agencies"
          )}`}
        >
          <span>Agencies</span>
        </Link>
      </nav>
    </div>
  )
}

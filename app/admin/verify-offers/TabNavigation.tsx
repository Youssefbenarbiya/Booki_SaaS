"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface TabNavigationProps {
  statusCounts: { [key: string]: number }
  statusLabels: { [key: string]: string }
}

export default function TabNavigation({
  statusCounts,
  statusLabels,
}: TabNavigationProps) {
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get("status") || "pending"

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {Object.entries(statusLabels).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/verify-offers?status=${key}`}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                currentStatus === key
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            {label}
            <span
              className={`
                ml-2 py-0.5 px-2 rounded-full text-xs
                ${
                  currentStatus === key
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-600"
                }
              `}
            >
              {statusCounts[key]}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

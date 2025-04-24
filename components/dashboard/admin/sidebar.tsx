"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useTranslations } from "next-intl"

interface SidebarProps {
  locale?: string
}

export function Sidebar({ locale = "en" }: SidebarProps) {
  const pathname = usePathname()
  const params = useParams()

  // Get locale from props or params
  const currentLocale = locale || (params.locale as string) || "en"

  // This hook will only work if the component is within a NextIntlProvider
  // with the correct locale set at the app level
  const t = useTranslations("admin")

  const isActive = (path: string) => {
    return pathname === path
      ? "bg-gray-900 text-white"
      : "text-gray-300 hover:bg-gray-700"
  }

  return (
    <div className="flex flex-col w-64 bg-gray-800 mt-[30px]">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
        <span className="text-xl font-bold text-white">{t("panel")}</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link
          href={`/${currentLocale}/admin`}
          className={`flex items-center px-4 py-2 rounded-md ${isActive(
            `/${currentLocale}/admin`
          )}`}
        >
          <span>{t("dashboard")}</span>
        </Link>
        <Link
          href={`/${currentLocale}/admin/verify-offers`}
          className={`flex items-center px-4 py-2 rounded-md ${isActive(
            `/${currentLocale}/admin/verify-offers`
          )}`}
        >
          <span>{t("verifyOffers")}</span>
        </Link>
        <Link
          href={`/${currentLocale}/admin/agencies`}
          className={`flex items-center px-4 py-2 rounded-md ${isActive(
            `/${currentLocale}/admin/agencies`
          )}`}
        >
          <span>{t("agencies")}</span>
        </Link>
        <Link
          href={`/${currentLocale}/admin/users`}
          className={`flex items-center px-4 py-2 rounded-md ${isActive(
            `/${currentLocale}/admin/users`
          )}`}
        >
          <span>{t("users")}</span>
        </Link>
      </nav>
    </div>
  )
}

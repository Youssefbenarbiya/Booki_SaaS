import Link from "next/link"
import { ReactNode } from "react"

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <aside className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-lg font-bold">General</h2>
        <nav className="mt-4">
          <ul>
            <li className="py-2">
              <Link
                href="/profile/dashboard"
                className="text-gray-600 hover:text-black"
              >
                Dashboard
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/user/profile/personal-info"
                className="text-gray-600 hover:text-black"
              >
                Personal Information
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/profile/messages"
                className="text-gray-600 hover:text-black"
              >
                Messages
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/profile/favorites"
                className="text-gray-600 hover:text-black"
              >
                My Favorites
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/profile/services"
                className="text-gray-600 hover:text-black"
              >
                Add My Service
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/profile/compare"
                className="text-gray-600 hover:text-black"
              >
                Compare
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/user/profile/bookingHistory"
                className="text-gray-600 hover:text-black"
              >
                History
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/profile/quick-assistance"
                className="text-gray-600 hover:text-black"
              >
                Quick Assistance
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/profile/logout"
                className="text-gray-600 hover:text-black"
              >
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="w-3/4 p-4">{children}</main>
    </div>
  )
}

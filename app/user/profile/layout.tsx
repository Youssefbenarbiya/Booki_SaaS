"use client"

import { ReactNode, useState } from "react"
import Dashboard from "./components/dashboard"
export default function ProfileLayout({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex">
      <aside className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-lg font-bold">General</h2>
        <nav className="mt-4">
          <ul>
            <li className="py-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-gray-600 hover:text-black"
              >
                Dashboard
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => setActiveTab("personal-info")}
                className="text-gray-600 hover:text-black"
              >
                Personal Information
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => setActiveTab("messages")}
                className="text-gray-600 hover:text-black"
              >
                Messages
              </button>
            </li>
            <li className="py-2">
              <a href="#favorites" className="text-gray-600 hover:text-black">
                My Favorites
              </a>
            </li>
            <li className="py-2">
              <a href="#services" className="text-gray-600 hover:text-black">
                Add My Service
              </a>
            </li>
            <li className="py-2">
              <a href="#compare" className="text-gray-600 hover:text-black">
                Compare
              </a>
            </li>
            <li className="py-2">
              <a href="#history" className="text-gray-600 hover:text-black">
                History
              </a>
            </li>
            <li className="py-2">
              <a
                href="#quick-assistance"
                className="text-gray-600 hover:text-black"
              >
                Quick Assistance
              </a>
            </li>
            <li className="py-2">
              <a href="#logout" className="text-gray-600 hover:text-black">
                Logout
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="w-3/4 p-4">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "personal-info" && children}
        {activeTab === "messages" && <div>Messages Content</div>}
      </main>
    </div>
  )
}

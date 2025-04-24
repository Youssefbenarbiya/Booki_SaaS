import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agency Profile",
  description: "Manage your travel agency profile information",
}

export default function AgencyProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 min-h-full">
      {children}
    </div>
  )
} 
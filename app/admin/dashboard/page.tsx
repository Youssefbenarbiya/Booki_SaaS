import { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: `Dashboard`,
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: await headers(),
  })
  if (!session) {
    return redirect("/sign-in")
  }
  if (session.user.role !== "admin") {
    return redirect("/")
  }
  return (
    <div>
      <p>Dashboard page</p>
    </div>
  )
}

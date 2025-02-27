import { auth } from "@/auth"
import { Metadata } from "next"
import { UpdateUserInfo } from "./profile-form"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: `Customer Profile`,
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: await headers(),
  })

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="bg-gray-100 h-[200px]">{/* Profile Banner */}</div>
      <UpdateUserInfo session={session} />
    </div>
  )
}

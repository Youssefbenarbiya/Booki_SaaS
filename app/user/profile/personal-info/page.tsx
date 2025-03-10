import { auth } from "@/auth"
import { Metadata } from "next"
import { headers } from "next/headers"
import { UpdateUserInfo } from "./profile-form"

export const metadata: Metadata = {
  title: `Personal Information`,
}

export default async function PersonalInfoPage() {
  const session = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: await headers(),
  })

  if (!session) {
    // Handle no session case, e.g. redirect or return null
    return null
  }

  return (
    <div className="mt-[70px]">
      <UpdateUserInfo session={session} />
    </div>
  )
}

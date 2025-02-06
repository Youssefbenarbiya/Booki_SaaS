import { auth } from "@/auth"
import { Metadata } from "next"
import { headers } from "next/headers"
import { UpdateUserInfo } from "./profile-form"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: `Customer Profile`,
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    return redirect("/sign-in")
  }
  return (
    <div >
        <UpdateUserInfo session={session} />
        <div className="mb-24" />
    </div>
  )
}

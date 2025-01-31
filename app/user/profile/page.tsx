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
    <div className="flex h-screen min-h-screen pt-20 flex-col">
      <main className="flex-1 wrapper mx-auto space-y-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <h2 className="h2-bold">Profile</h2>
        <UpdateUserInfo session={session} />
        <div className="mb-24" />
      </main>
    </div>
  )
}

import { auth } from "@/auth"
import { Metadata } from "next"
import { headers } from "next/headers"
import { UpdateUserInfo } from "./profile-form"
import { redirect } from "next/navigation"
import Image from "next/image"

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
    <div>
      <div className="relative w-full h-[200px]">
        <Image
          src="/assets/ProfileBanner.jpg"
          alt="Profile banner"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: "cover",
          }}
        />
      </div>
      <div className="mb-24" />

      <UpdateUserInfo session={session} />
      <div className="mb-24" />
    </div>
  )
}

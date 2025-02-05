import { auth } from "@/auth"
import { headers } from "next/headers"

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  console.log(session)
    return (
    <div>
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-7xl">Hello</h1>
          <p>You are logged in as: {session?.user?.email}</p>
          <p>{session?.user?.role}</p>
          <p>{session?.user?.name}</p>
          <p>{session?.user?.phoneNumber}</p>
        </div>
    </div>
  )
}

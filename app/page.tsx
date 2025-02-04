import { auth } from "@/auth"
import Header from "@/components/header/header"
import { headers } from "next/headers"

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return (
    <div>
      <Header />
      <main className="flex items-center justify-center grow p-8">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-7xl">Hello</h1>
          <p>You are logged in as: {session?.user?.email}</p>
          <p>{session?.user?.role}</p>
          <p>{session?.user?.name}</p>
        </div>
      </main>
    </div>
  )
}

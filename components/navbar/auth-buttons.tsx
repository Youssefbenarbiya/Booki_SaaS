import { auth } from "@/auth"
import { headers } from "next/headers"
import { NavLink } from "./nav-link"

export default async function AuthButtons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div className="flex gap-6 justify-center">
      {!session && (
        <>
          <NavLink href="/sign-up">Register</NavLink>
          <NavLink href="/en/sign-in">Sign In</NavLink>
        </>
      )}
    </div>
  )
}

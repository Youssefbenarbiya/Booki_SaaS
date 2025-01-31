import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@/auth"
import { headers } from "next/headers"
// import SignoutButton from "@/components/signout-button"

export default async function AuthButtons() {
 const session = await auth.api.getSession({
   headers: await headers(),
 })

//   if (session) {
//     return (
//       <div className="flex items-center gap-2">
//         <SignoutButton />
//       </div>
//     )
//   }
return (
  <div className="flex gap-2 justify-center">
    {!session && (
      <>
        <Link href="/sign-in">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign Up
          </Button>
        </Link>
      </>
    )}
  </div>
)
}

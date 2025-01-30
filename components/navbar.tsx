import { Button } from "@/components/ui/button"
import Link from "next/link"
export default async function Navbar() {

  return (
    <nav className="justify-between items-center py-3 px-4 fixed top-0 left-0 right-0 z-50">
      <Link href="/" className="font-bold">
        better-auth
      </Link>
     
        <div className="gap-2 justify-center">
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Sign Up</Button>
          </Link>
        </div>
      
    </nav>
  )
}

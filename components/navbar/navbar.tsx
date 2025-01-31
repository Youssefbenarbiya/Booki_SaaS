import Link from "next/link"
import AuthButtons from "@/components/navbar/auth-buttons"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-3 px-4 fixed top-0 left-0 right-0 z-50 bg-background text-foreground border-b">
      <Link href="/" className="text-xl font-bold">
        Booki
      </Link>
      <div className="flex items-center gap-4">
        <AuthButtons />
        <ModeToggle />
      </div>
    </nav>
  )
}

import Link from "next/link"
import AuthButtons from "@/components/navbar/auth-buttons"
import { ModeToggle } from "./mode-toggle"
import { Mail, Phone } from "lucide-react"
import { FaFacebook, FaInstagram } from "react-icons/fa"

export default async function Navbar() {
  return (
    <nav className="flex justify-between items-center py-3 px-4 fixed top-0 left-0 right-0 z-50 bg-[#FA8B02] text-foreground border-b h-[30px]">
      <div className="flex space-x-2">
        <Link href="#" className="text-xl font-bold">
          <FaFacebook />
        </Link>
        <Link href="#" className="text-xl font-bold">
          <FaInstagram />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4" />
        <p>+216 99 999 999</p>
        <span>|</span>
        <Mail className="w-4 h-4" />
        <p>booki@gmail.com</p>
      </div>
      <div className="flex items-center gap-4">
        <AuthButtons />
        <ModeToggle />
      </div>
    </nav>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"

const Header = () => {
  return (
    <header className="bg-background shadow-md mt-[50px] ">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center h-[50px]">
        <div className="flex items-center space-x-6">
          <Image src="/assets/icons/logo.png" alt="Logo" width={50} height={50} />
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/" className="text-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-foreground hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-foreground hover:text-primary"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="w-full">
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header

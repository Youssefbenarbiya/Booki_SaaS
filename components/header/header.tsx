import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"
import { auth } from "@/auth"
import SignoutButton from "../navbar/signout-button"
import { headers } from "next/headers"

export default async function Header() {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: await headers(),
  })

  return (
    <header className="bg-background shadow-md sticky top-0 left-0 right-0 z-50 w-full mt-[30px] border-b">
      <div className="w-full px-4 py-2 flex justify-between items-center h-[50px]">
        <Link href="/" className="text-xl font-bold">
          <div className="flex items-center space-x-6">
            <Image
              src="/assets/icons/logo.png"
              alt="Logo"
              width={50}
              height={50}
            />
          </div>
        </Link>
        <div className="flex items-center space-x-8 ml-auto">
          <nav>
            <ul className="flex space-x-8">
              <li>
                <Link
                  href="/"
                  className="text-foreground hover:text-primary font-poppins font-semibold text-[18px] leading-[27px]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-foreground hover:text-primary font-poppins font-semibold text-[18px] leading-[27px]"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-foreground hover:text-primary font-poppins font-semibold text-[18px] leading-[27px]"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-foreground hover:text-primary font-poppins font-semibold text-[18px] leading-[27px]"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="mr-[100px]">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {session ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link href="/user/profile" className="w-full">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {session.user.role == "admin" && (
                      <DropdownMenuItem>
                        <Link href="/admin/dashboard" className="w-full">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="p-0 mb-1">
                      <SignoutButton />
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

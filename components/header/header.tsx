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
import Navbar from "@/components/navbar/navbar"
import { Locale } from "@/i18n/routing"

interface HeaderProps {
  locale: Locale
}

export default async function Header({ locale = "en" }: HeaderProps) {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: await headers(),
  })

  return (
    <>
      <Navbar />
      <header className="bg-background shadow-md sticky top-[30px] left-0 right-0 z-40 w-full border-b">
        <div className="w-full px-4 py-2 flex justify-between items-center h-[50px]">
          <Link href={`/${locale}`} className="text-xl font-bold">
            <div className="flex items-center space-x-6">
              <Image
                src="/assets/icons/logo.png"
                alt="Logo"
                width={50}
                height={50}
                priority
              />
            </div>
          </Link>
          <div className="flex items-center space-x-8 ml-auto">
            <nav>
              <ul className="flex space-x-8">
                <li>
                  <Link
                    href={`/${locale}`}
                    className="text-foreground hover:text-primary font-poppins font-semibold text-[18px] leading-[27px]"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/contact`}
                    className="text-foreground hover:text-primary font-poppins font-semibold text-[18px] leading-[27px]"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/faq`}
                    className="text-foreground hover:text-primary font-poppins font-semibold text-[18px] leading-[27px]"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/blog`}
                    className="text-foreground hover:text-primary font-poppins font-semibold text-[18px] leading-[27px]"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </nav>
            <div>
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="mr-[100px]">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
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
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/user/profile`} className="w-full">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {session.user.role !== "customer" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href={
                            session.user.role === "admin"
                              ? `/${locale}/admin`
                              : `/${locale}/agency/dashboard`
                          }
                          className="w-full"
                        >
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="p-0 mb-1">
                      <SignoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="mr-[100px] w-10 h-10" />
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

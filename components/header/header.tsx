import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { auth } from "@/auth"
import SignoutButton from "../navbar/signout-button"
import { headers } from "next/headers"
import Navbar from "@/components/navbar/navbar"
import { Locale } from "@/i18n/routing"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, LayoutDashboard } from "lucide-react"

interface HeaderProps {
  locale: Locale
}

export default async function Header({ locale = "en" }: HeaderProps) {
  const session = await auth.api.getSession({
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
                width={150}
                height={150}
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
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-full p-0 relative hover:bg-accent"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            session.user?.image ||
                            "/assets/icons/logo-blank.png"
                          }
                          alt={session.user?.name || "User"}
                        />
                        <AvatarFallback>
                          {session.user?.name?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {/* Green online indicator */}
                      <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                      <span className="sr-only">Online status</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 p-2 rounded-lg shadow-lg"
                    align="end"
                  >
                    <div className="flex items-center p-2 mb-1 rounded-md bg-accent/50">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage
                          src={
                            session.user?.image ||
                            "/assets/icons/logo-blank.png"
                          }
                          alt={session.user?.name || "User"}
                        />
                        <AvatarFallback>
                          {session.user?.name?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      asChild
                      className="flex items-center cursor-pointer p-2 rounded-md hover:bg-accent"
                    >
                      <Link
                        href={`/${locale}/user/profile`}
                        className="w-full flex items-center"
                      >
                        <User className="w-4 h-4 mr-2" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {session.user.role !== "customer" && (
                      <DropdownMenuItem
                        asChild
                        className="flex items-center cursor-pointer p-2 rounded-md hover:bg-accent"
                      >
                        <Link
                          href={
                            session.user.role === "admin"
                              ? `/${locale}/admin`
                              : `/${locale}/agency/dashboard`
                          }
                          className="w-full flex items-center"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem className="p-0">
                      <SignoutButton className="flex w-full items-center p-2 text-orange-500 bg-orange-50 rounded-md hover:bg-orange-50 cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Sign out</span>
                      </SignoutButton>
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

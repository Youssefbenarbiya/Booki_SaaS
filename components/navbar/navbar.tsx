import Link from "next/link"
import AuthButtons from "@/components/navbar/auth-buttons"
import { ModeToggle } from "./mode-toggle"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { auth } from "@/auth"
import { headers } from "next/headers"
import SignoutButton from "./signout-button"

export default async function Navbar() {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: await headers(),
  })

  return (
    <nav className="flex justify-between items-center py-3 px-4 fixed top-0 left-0 right-0 z-50 bg-background text-foreground border-b h-[30px]">
      <Link href="/" className="text-xl font-bold">
        Booki
      </Link>
      <div className="flex items-center gap-4">
        <AuthButtons />
        <ModeToggle />

        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  className="m-4 relative w-8 h-8 rounded-full ml-2"
                >
                  {session?.user?.name}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <Link className="w-full" href="/user/profile">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 mb-1">
                <SignoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}

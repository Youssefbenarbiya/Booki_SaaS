import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="w-full bg-[#FFF6F0] px-6 py-12">
      <div className="container grid gap-8 lg:grid-cols-[1fr_2fr_1fr_1.5fr]">
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                <span className="text-orange-500">Booking</span>osteiflow.
              </span>
            </div>
          </Link>
          <p className="text-muted-foreground">
            We always make our customers happy by providing as many choises as
            possible
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-orange-500 hover:text-orange-600">
              <Facebook className="h-6 w-6" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-orange-500 hover:text-orange-600">
              <Twitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-orange-500 hover:text-orange-600">
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-orange-500">AFTERCODE</span> © 2024, All
            Rights Reserved
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr]">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  News
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Menu
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  Why 2rism
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  Account
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Feedback
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Subscribe on our destination review newsletters
          </h3>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="email"
              placeholder="osteiflowbooking@gmail.com"
              className="bg-white"
            />
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FooterGallery from "./footerGalory"
export function Footer() {
  return (
    <div>
      <FooterGallery/>
      <footer className="w-full bg-black text-white px-6 py-12">
        <div className="container grid gap-8 lg:grid-cols-[1.5fr_2fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex items-center">
                <span className="text-2xl font-bold">
                  <span className="text-orange-500">Booking</span>ostelflow.
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm">
              We always make our customers happy by providing as many choices as
              possible
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-white hover:text-orange-500">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-white hover:text-orange-500">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-white hover:text-orange-500">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-orange-500">AFTERCODE</span>
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">About</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    News
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Menu
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Why 2rism
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Partner With Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Account
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Support Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Feedback
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
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
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="ostelflowbooking@gmail.com"
                className="bg-transparent border-gray-700 text-white placeholder:text-gray-400"
              />
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 w-fit"
              >
                <span className="sr-only">Subscribe</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
        <div className="container mt-8 flex justify-end">
          <div className="flex gap-2">
            <Image
              src="/assets/visa.png"
              alt="Visa"
              width={40}
              height={25}
              className="h-[25px] w-auto"
            />
            <Image
              src="/assets/mastercard.png"
              alt="Mastercard"
              width={40}
              height={25}
              className="h-[25px] w-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}

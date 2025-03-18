import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Question mark icon */}
        <div className="relative inline-block">
          <div className="text-[10rem] font-bold text-[#1e2a35] leading-none relative">
            <span
              className="inline-block"
              style={{ textShadow: "1px 1px 0 #fff, -1px -1px 0 #fff" }}
            >
              404
            </span>
          </div>
          <div className="absolute top-0 right-4 -mt-2">
            <div className="rounded-full border border-gray-200 bg-white p-2 shadow-sm">
              <HelpCircle className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-[#1e2a35] mt-6 mb-3">
          Oops! page not found
        </h2>

        <p className="text-gray-600 text-sm mb-8 max-w-sm mx-auto">
         
        </p>

        <Link href="/" className="inline-block">
          <Button className="bg-[#1e2a35] hover:bg-[#2c3e50] text-white rounded-full px-6">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

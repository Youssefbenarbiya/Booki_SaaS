"use client"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotAllowed() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md">
        <AlertTriangle className="text-red-600 dark:text-red-400 w-12 h-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Access Denied
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          You do not have permission to view this page.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  )
}

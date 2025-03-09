"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

export default function InvoiceDownloadButton({
  invoicePath,
  bookingId,
}: {
  invoicePath: string
  bookingId: number
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)

    try {
      // Fetch the HTML content
      const response = await fetch(invoicePath)
      const htmlContent = await response.text()

      // Dynamically import the PDF conversion utilities to reduce bundle size
      const { jsPDF } = await import("jspdf")
      const html2canvas = (await import("html2canvas")).default

      // Create a temporary div to render the HTML
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = htmlContent
      tempDiv.style.position = "absolute"
      tempDiv.style.left = "-9999px"
      document.body.appendChild(tempDiv)

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 1.5, // Higher scale for better quality
        logging: false,
        useCORS: true,
      })

      // Initialize PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Add canvas image to PDF
      const imgData = canvas.toDataURL("image/png")
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      // Save the PDF
      pdf.save(`invoice_${bookingId}.pdf`)

      // Clean up
      document.body.removeChild(tempDiv)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      className="w-full flex items-center gap-2"
      variant="outline"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {isLoading ? "Generating PDF..." : "Download Booking Invoice"}
    </Button>
  )
}

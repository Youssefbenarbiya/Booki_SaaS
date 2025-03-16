import jsPDF from "jspdf"

export interface CarData {
  id: number
  name: string
  model: string
  make: string
  year: number
  color: string
  licensePlate?: string
  category?: string
  transmission?: string
  fuelType?: string
  features?: string[]
  image?: string
}

export interface CarBookingData {
  id: number
  startDate: Date | string
  endDate: Date | string
  totalPrice: number
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentDate?: Date | string
  paymentId?: string
}

export interface CustomerData {
  fullName: string
  email: string
  phone?: string
  address?: string
  drivingLicense?: string
}

export function generateCarBookingPDF(carData: CarData, bookingData: CarBookingData, customerData: CustomerData) {
  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  })

  // Add custom font
  doc.setFont("helvetica")

  // Constants for styling
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  const primaryColor = [41, 128, 185] // RGB for a nice blue
  const secondaryColor = [52, 73, 94] // RGB for a dark slate
  const accentColor = [26, 188, 156] // RGB for a teal accent
  let currentY = margin

  // Add decorative header background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 120, "F")

  // Add white decorative shape
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(255, 255, 255)
  doc.circle(pageWidth - 60, 60, 100, "F")
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2], 0.8)
  doc.circle(pageWidth - 40, 40, 50, "F")

  // Header text
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.text("CAR RENTAL CONFIRMATION", margin, 70)

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Your vehicle is reserved and ready!", margin, 90)

  currentY = 140

  // Helper to draw a section header with improved styling
  const drawSectionHeader = (title: string) => {
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 30, 3, 3, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text(title, margin + 15, currentY + 20)

    currentY += 40
    doc.setTextColor(60, 60, 60) // Dark gray text for content
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
  }

  // Helper to draw info item with label and value
  const drawInfoItem = (label: string, value: string | number | undefined, indent = 0) => {
    if (value === undefined || value === null) return

    const valueStr = typeof value === "number" ? value.toString() : value

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(label, margin + indent, currentY)

    doc.setFont("helvetica", "normal")
    doc.text(valueStr, margin + 150 + indent, currentY)

    currentY += 20
  }

  // Helper to handle long text with wrapping
  const drawWrappedText = (label: string, text: string | undefined, indent = 0) => {
    if (!text) return

    const maxWidth = pageWidth - margin * 2 - 150 - indent

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(label, margin + indent, currentY)

    doc.setFont("helvetica", "normal")

    // Split text to handle wrapping
    const textLines = doc.splitTextToSize(text, maxWidth)
    doc.text(textLines, margin + 150 + indent, currentY)

    // Adjust currentY based on number of lines
    currentY += 20 * textLines.length
  }

  // Format date function
  const formatDate = (date: Date | string) => {
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Section: Car Details
  drawSectionHeader("Vehicle Details")
  drawInfoItem("Car:", `${carData.make} ${carData.model} (${carData.year})`)
  drawInfoItem("Color:", carData.color)
  if (carData.licensePlate) {
    drawInfoItem("License Plate:", carData.licensePlate)
  }
  if (carData.category) {
    drawInfoItem("Category:", carData.category)
  }
  if (carData.transmission) {
    drawInfoItem("Transmission:", carData.transmission)
  }
  if (carData.fuelType) {
    drawInfoItem("Fuel Type:", carData.fuelType)
  }

  // Display car features as a comma-separated list
  if (carData.features && carData.features.length > 0) {
    const featuresText = carData.features.join(", ")
    drawWrappedText("Features:", featuresText)
  }

  currentY += 10

  // Section: Booking Details
  drawSectionHeader("Rental Details")
  drawInfoItem("Booking ID:", `#${bookingData.id}`)
  drawInfoItem("Pick-up Date:", formatDate(bookingData.startDate))
  drawInfoItem("Return Date:", formatDate(bookingData.endDate))
  drawInfoItem(
    "Total Price:",
    `$${Number(bookingData.totalPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  drawInfoItem("Status:", bookingData.status)
  currentY += 10

  // Section: Payment Information
  drawSectionHeader("Payment Information")
  drawInfoItem("Payment Method:", bookingData.paymentMethod)
  drawInfoItem("Payment Status:", bookingData.paymentStatus)
  if (bookingData.paymentDate) {
    drawInfoItem("Payment Date:", formatDate(bookingData.paymentDate))
  }
  if (bookingData.paymentId) {
    drawInfoItem("Payment ID:", bookingData.paymentId)
  }
  currentY += 10

  // Section: Customer Information
  drawSectionHeader("Customer Information")
  drawInfoItem("Name:", customerData.fullName)
  drawInfoItem("Email:", customerData.email)
  if (customerData.phone) {
    drawInfoItem("Phone:", customerData.phone)
  }
  if (customerData.address) {
    drawWrappedText("Address:", customerData.address)
  }
  if (customerData.drivingLicense) {
    drawInfoItem("Driving License:", customerData.drivingLicense)
  }
  currentY += 10

  // Add a QR code placeholder
  doc.setDrawColor(60, 60, 60)
  doc.setLineWidth(1)
  doc.rect(pageWidth - 100, currentY - 100, 70, 70)
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  doc.text("Booking Reference", pageWidth - 65, currentY - 110, { align: "center" })
  doc.text("Scan to view details", pageWidth - 65, currentY - 20, { align: "center" })

  // Add important information box
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
  doc.setFillColor(255, 255, 255)
  doc.setLineWidth(1)
  doc.roundedRect(margin, currentY + 20, pageWidth - margin * 2, 80, 3, 3, "S")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text("Important Information", margin + 15, currentY + 40)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  const infoText = [
    "• Please bring your driver's license and the credit card used for payment.",
    "• A security deposit may be required at pick-up.",
    "• Please check the vehicle for any damage before driving away.",
    "• Return the vehicle with the same fuel level as at pick-up to avoid additional charges.",
  ]

  let infoY = currentY + 60
  infoText.forEach((line) => {
    doc.text(line, margin + 15, infoY)
    infoY += 15
  })

  // Add a decorative footer
  const footerY = pageHeight - 80
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.rect(0, footerY, pageWidth, 80, "F")

  // Footer text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text("Thank you for choosing our car rental service!", pageWidth / 2, footerY + 30, { align: "center" })
  doc.text("For questions or changes, please contact our customer service.", pageWidth / 2, footerY + 50, {
    align: "center",
  })

  // Add page number
  doc.setFontSize(9)
  doc.text(`Page 1 of 1 | Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 20, {
    align: "center",
  })

  // Save the generated PDF file
  doc.save(`car-booking-confirmation-${bookingData.id}.pdf`)
}


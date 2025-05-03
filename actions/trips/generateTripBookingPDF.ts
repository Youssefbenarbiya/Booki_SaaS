/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface TripData {
  name: string
  destination: string
  startDate: string
  endDate: string
  // Update the price field to be optional and add the new pricing fields
  price?: number
  originalPrice?: number
  priceAfterDiscount?: number
  discountPercentage?: number
  activities?: Array<{
    activityName: string
    scheduledDate: string
    description?: string
  }>
}

export interface TripBookingData {
  seatsBooked: number
  totalPrice: number
  bookingDate: string
}

export interface UserData {
  name: string
  email: string
  phone?: string
}

export function generateTripBookingPDF(
  tripData: TripData,
  bookingData: TripBookingData,
  userData: UserData
) {
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
  doc.text("BOOKING CONFIRMATION", margin, 70)

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Your adventure awaits!", margin, 90)

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
  }

  // Helper to draw info item with label and value
  const drawInfoItem = (label: string, value: string, indent = 0) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(label, margin + indent, currentY)

    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 150 + indent, currentY)

    currentY += 20
  }

  // Section: Trip Details
  drawSectionHeader("Trip Details")
  drawInfoItem("Trip Name:", tripData.name)
  drawInfoItem("Destination:", tripData.destination)
  drawInfoItem("Start Date:", tripData.startDate)
  drawInfoItem("End Date:", tripData.endDate)

  // Calculate the effective price based on available pricing info
  const effectivePrice = determineEffectivePrice(tripData)

  drawInfoItem(
    "Price per Seat:",
    `$${effectivePrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  )

  // If there's a discount, show the original price and discount percentage
  if (tripData.discountPercentage && tripData.originalPrice) {
    drawInfoItem(
      "Original Price:",
      `$${tripData.originalPrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      20
    )
    drawInfoItem("Discount Applied:", `${tripData.discountPercentage}%`, 20)
  }

  currentY += 10

  // Section: Booking Details
  drawSectionHeader("Booking Details")
  drawInfoItem("Seats Booked:", bookingData.seatsBooked.toString())
  drawInfoItem(
    "Total Price:",
    `$${bookingData.totalPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  )
  drawInfoItem("Booking Date:", bookingData.bookingDate)
  currentY += 10

  // Section: User Details
  drawSectionHeader("Traveler Information")
  drawInfoItem("Name:", userData.name)
  drawInfoItem("Email:", userData.email)
  if (userData.phone) {
    drawInfoItem("Phone:", userData.phone)
  }
  currentY += 10

  // Section: Trip Activities (if available)
  if (tripData.activities && tripData.activities.length > 0) {
    drawSectionHeader("Trip Activities")

    // Improved table styling
    autoTable(doc, {
      startY: currentY,
      head: [["Activity", "Date", "Description"]],
      body: tripData.activities.map((activity) => [
        activity.activityName,
        activity.scheduledDate,
        activity.description || "",
      ]),
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 6,
        lineColor: [220, 220, 220],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: secondaryColor as [number, number, number],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        2: { cellWidth: "auto" },
      },
    })

    // Update currentY based on the table end position
    const finalY = (doc as any).lastAutoTable.finalY || currentY
    currentY = finalY + 20
  }

  // Add a decorative footer
  const footerY = pageHeight - 80
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.rect(0, footerY, pageWidth, 80, "F")

  // Footer text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text("Thank you for booking with us!", pageWidth / 2, footerY + 30, {
    align: "center",
  })
  doc.text(
    "For questions or changes, please contact customer service.",
    pageWidth / 2,
    footerY + 50,
    {
      align: "center",
    }
  )

  // Add page number
  doc.setFontSize(9)
  doc.text(
    `Page 1 of 1 | Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    pageHeight - 20,
    {
      align: "center",
    }
  )

  // Add a QR code placeholder (you can replace this with actual QR code generation)
  doc.setDrawColor(60, 60, 60)
  doc.setLineWidth(1)
  doc.rect(pageWidth - 100, currentY - 100, 70, 70)
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  doc.text("Booking Reference", pageWidth - 65, currentY - 110, {
    align: "center",
  })
  doc.text("Scan to view details", pageWidth - 65, currentY - 20, {
    align: "center",
  })

  doc.save("trip-booking-confirmation.pdf")
}

// Helper function to determine the effective price based on available pricing info
function determineEffectivePrice(tripData: TripData): number {
  // Case 1: If priceAfterDiscount exists and there's a discount, use it
  if (
    tripData.priceAfterDiscount &&
    tripData.discountPercentage &&
    tripData.discountPercentage > 0
  ) {
    return Number(tripData.priceAfterDiscount)
  }

  // Case 2: If original price exists, use it
  if (tripData.originalPrice !== undefined) {
    return Number(tripData.originalPrice)
  }

  // Case 3: If the old price field exists, use it
  if (tripData.price !== undefined) {
    return tripData.price
  }

  // Case 4: Fallback to 0 if no price information is available
  return 0
}

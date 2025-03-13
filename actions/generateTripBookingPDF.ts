// generateTripBookingPDF.ts
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface TripData {
  name: string
  destination: string
  startDate: string
  endDate: string
  price: number
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
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  })

  // Constants for styling
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let currentY = margin

  // Header
  doc.setFontSize(22)
  doc.setTextColor(40)
  doc.text("Trip Booking Confirmation", pageWidth / 2, currentY, {
    align: "center",
  })
  currentY += 30

  // Draw separator line
  doc.setLineWidth(1)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 20

  // Helper to draw a section header and reset text color
  const drawSectionHeader = (title: string) => {
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255) // White text
    doc.setFillColor(0, 102, 204) // Blue background
    doc.rect(margin, currentY, pageWidth - margin * 2, 25, "F")
    doc.text(title, margin + 10, currentY + 17)

    currentY += 35
    doc.setTextColor(0) // Reset text color to black
  }

  // Section: User Details
  drawSectionHeader("User Details")
  doc.setFontSize(12)
  doc.text(`Name: ${userData.name}`, margin, currentY)
  currentY += 18
  doc.text(`Email: ${userData.email}`, margin, currentY)
  currentY += 18
  if (userData.phone) {
    doc.text(`Phone: ${userData.phone}`, margin, currentY)
    currentY += 18
  }
  currentY += 10

  // Section: Trip Details
  drawSectionHeader("Trip Details")
  doc.text(`Trip Name: ${tripData.name}`, margin, currentY)
  currentY += 18
  doc.text(`Destination: ${tripData.destination}`, margin, currentY)
  currentY += 18
  doc.text(`Start Date: ${tripData.startDate}`, margin, currentY)
  currentY += 18
  doc.text(`End Date: ${tripData.endDate}`, margin, currentY)
  currentY += 18
  doc.text(`Price per Seat: $${tripData.price}`, margin, currentY)
  currentY += 10

  // Section: Booking Details
  drawSectionHeader("Booking Details")
  doc.text(`Seats Booked: ${bookingData.seatsBooked}`, margin, currentY)
  currentY += 18
  doc.text(`Total Price: $${bookingData.totalPrice}`, margin, currentY)
  currentY += 18
  doc.text(`Booking Date: ${bookingData.bookingDate}`, margin, currentY)
  currentY += 20

  // Section: Trip Activities (if available)
  if (tripData.activities && tripData.activities.length > 0) {
    drawSectionHeader("Trip Activities")
    autoTable(doc, {
      startY: currentY,
      head: [["Activity", "Scheduled Date", "Description"]],
      body: tripData.activities.map((activity) => [
        activity.activityName,
        activity.scheduledDate,
        activity.description || "",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
    })
  }

  doc.save("trip-booking-confirmation.pdf")
}

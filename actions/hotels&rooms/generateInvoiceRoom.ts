import jsPDF from "jspdf"

export interface HotelData {
  name: string
  description: string
  address: string
  city: string
  country: string
  rating: number
  latitude?: string
  longitude?: string
  amenities: string[]
  images: string[]
}

export interface RoomData {
  name: string
  description: string
  capacity: number
  pricePerNightAdult: number
  pricePerNightChild: number
  roomType: string
  amenities: string[]
  images: string[]
}

export interface RoomBookingData {
  checkIn: string
  checkOut: string
  totalPrice: number
  bookingDate: string
  paymentStatus?: string
  paymentMethod?: string
}

export interface UserData {
  name: string
  email: string
  phoneNumber?: string
}

export function generateHotelRoomBookingPDF(
  hotelData: HotelData,
  roomData: RoomData,
  bookingData: RoomBookingData,
  userData: UserData,
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
  doc.text("HOTEL BOOKING CONFIRMATION", margin, 70)

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Your stay is confirmed!", margin, 90)

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
  const drawInfoItem = (label: string, value: string, indent = 0) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(label, margin + indent, currentY)

    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 150 + indent, currentY)

    currentY += 20
  }

  // Helper to handle long text with wrapping
  const drawWrappedText = (label: string, text: string, indent = 0) => {
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

  // Section: Hotel Details
  drawSectionHeader("Hotel Details")
  drawInfoItem("Hotel Name:", hotelData.name)
  drawWrappedText("Description:", hotelData.description)
  drawInfoItem("Address:", hotelData.address)
  drawInfoItem("City:", hotelData.city)
  drawInfoItem("Country:", hotelData.country)
  drawInfoItem("Rating:", `${hotelData.rating} / 5`)

  // Display amenities as a comma-separated list
  if (hotelData.amenities.length > 0) {
    const amenitiesText = hotelData.amenities.join(", ")
    drawWrappedText("Amenities:", amenitiesText)
  }

  currentY += 10

  // Section: Room Details
  drawSectionHeader("Room Details")
  drawInfoItem("Room Name:", roomData.name)
  drawInfoItem("Room Type:", roomData.roomType)
  drawWrappedText("Description:", roomData.description)
  drawInfoItem("Capacity:", `${roomData.capacity} person(s)`)
  drawInfoItem(
    "Price per Night (Adult):",
    `$${roomData.pricePerNightAdult.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  drawInfoItem(
    "Price per Night (Child):",
    `$${roomData.pricePerNightChild.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )

  // Display room amenities as a comma-separated list
  if (roomData.amenities.length > 0) {
    const amenitiesText = roomData.amenities.join(", ")
    drawWrappedText("Room Amenities:", amenitiesText)
  }

  currentY += 10

  // Section: Booking Details
  drawSectionHeader("Booking Details")
  drawInfoItem("Check-In Date:", bookingData.checkIn)
  drawInfoItem("Check-Out Date:", bookingData.checkOut)
  drawInfoItem(
    "Total Price:",
    `$${bookingData.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  drawInfoItem("Booking Date:", bookingData.bookingDate)

  if (bookingData.paymentStatus) {
    drawInfoItem("Payment Status:", bookingData.paymentStatus)
  }

  if (bookingData.paymentMethod) {
    drawInfoItem("Payment Method:", bookingData.paymentMethod)
  }

  currentY += 10

  // Section: User Details
  drawSectionHeader("Guest Information")
  drawInfoItem("Name:", userData.name)
  drawInfoItem("Email:", userData.email)

  if (userData.phoneNumber) {
    drawInfoItem("Phone:", userData.phoneNumber)
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

  // Add a decorative footer
  const footerY = pageHeight - 80
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.rect(0, footerY, pageWidth, 80, "F")

  // Footer text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text("Thank you for choosing our hotel!", pageWidth / 2, footerY + 30, { align: "center" })
  doc.text("For questions or changes, please contact our reception desk.", pageWidth / 2, footerY + 50, {
    align: "center",
  })

  // Add page number
  doc.setFontSize(9)
  doc.text(`Page 1 of 1 | Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 20, {
    align: "center",
  })

  // Save the generated PDF file
  doc.save("hotel-room-booking-confirmation.pdf")
}


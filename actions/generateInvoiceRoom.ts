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
  doc.text("Hotel Room Booking Confirmation", pageWidth / 2, currentY, {
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
    doc.setFontSize(12)
  }

  // Section: User Details
  drawSectionHeader("User Details")
  doc.text(`Name: ${userData.name}`, margin, currentY)
  currentY += 18
  doc.text(`Email: ${userData.email}`, margin, currentY)
  currentY += 18
  if (userData.phoneNumber) {
    doc.text(`Phone: ${userData.phoneNumber}`, margin, currentY)
    currentY += 18
  }
  currentY += 10

  // Section: Hotel Details
  drawSectionHeader("Hotel Details")
  doc.text(`Hotel Name: ${hotelData.name}`, margin, currentY)
  currentY += 18
  doc.text(`Description: ${hotelData.description}`, margin, currentY)
  currentY += 18
  doc.text(`Address: ${hotelData.address}`, margin, currentY)
  currentY += 18
  doc.text(`City: ${hotelData.city}`, margin, currentY)
  currentY += 18
  doc.text(`Country: ${hotelData.country}`, margin, currentY)
  currentY += 10

  // Section: Room Details
  drawSectionHeader("Room Details")
  doc.text(`Room Name: ${roomData.name}`, margin, currentY)
  currentY += 18
  doc.text(`Room Type: ${roomData.roomType}`, margin, currentY)
  currentY += 18
  doc.text(`Description: ${roomData.description}`, margin, currentY)
  currentY += 18
  doc.text(`Capacity: ${roomData.capacity}`, margin, currentY)
  currentY += 18
  doc.text(
    `Price per Night (Adult): $${roomData.pricePerNightAdult}`,
    margin,
    currentY
  )
  currentY += 18
  doc.text(
    `Price per Night (Child): $${roomData.pricePerNightChild}`,
    margin,
    currentY
  )
  currentY += 10

  // Section: Booking Details
  drawSectionHeader("Booking Details")
  doc.text(`Check-In Date: ${bookingData.checkIn}`, margin, currentY)
  currentY += 18
  doc.text(`Check-Out Date: ${bookingData.checkOut}`, margin, currentY)
  currentY += 18
  doc.text(`Total Price: $${bookingData.totalPrice}`, margin, currentY)
  currentY += 18
  doc.text(`Booking Date: ${bookingData.bookingDate}`, margin, currentY)
  currentY += 18
  if (bookingData.paymentStatus) {
    doc.text(`Payment Status: ${bookingData.paymentStatus}`, margin, currentY)
    currentY += 18
  }
  if (bookingData.paymentMethod) {
    doc.text(`Payment Method: ${bookingData.paymentMethod}`, margin, currentY)
    currentY += 18
  }
  currentY += 20

  // Save the generated PDF file
  doc.save("hotel-room-booking-confirmation.pdf")
}

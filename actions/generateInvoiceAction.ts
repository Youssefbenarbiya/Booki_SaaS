"use server"

import fs from "fs/promises"
import path from "path"
import db from "@/db/drizzle"
import { roomBookings } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function generateInvoiceAction(
  bookingId: number,
  customerName: string,
  customerEmail: string
): Promise<string> {
  try {
    // Create uploads/invoice directory if it doesn't exist
    const invoiceDir = path.join(process.cwd(), "public", "uploads", "invoice")
    await fs.mkdir(invoiceDir, { recursive: true })

    // Get booking details with related room and hotel information
    const booking = await db.query.roomBookings.findFirst({
      where: eq(roomBookings.id, bookingId),
      with: {
        room: {
          with: {
            hotel: true,
          },
        },
      },
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    // Calculate nights
    const checkInDate = new Date(booking.checkIn)
    const checkOutDate = new Date(booking.checkOut)
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Format dates for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    // Generate invoice HTML
    const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Booking Invoice</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
          font-size: 16px;
          line-height: 24px;
        }
        .invoice-box table {
          width: 100%;
          line-height: inherit;
          text-align: left;
          border-collapse: collapse;
        }
        .invoice-box table td {
          padding: 5px;
          vertical-align: top;
        }
        .invoice-box table tr.top table td {
          padding-bottom: 20px;
        }
        .invoice-box table tr.top table td.title {
          font-size: 45px;
          line-height: 45px;
          color: #333;
        }
        .invoice-box table tr.information table td {
          padding-bottom: 40px;
        }
        .invoice-box table tr.heading td {
          background: #eee;
          border-bottom: 1px solid #ddd;
          font-weight: bold;
        }
        .invoice-box table tr.details td {
          padding-bottom: 20px;
        }
        .invoice-box table tr.item td {
          border-bottom: 1px solid #eee;
        }
        .invoice-box table tr.item.last td {
          border-bottom: none;
        }
        .invoice-box table tr.total td:nth-child(2) {
          border-top: 2px solid #eee;
          font-weight: bold;
        }
        @media only screen and (max-width: 600px) {
          .invoice-box table tr.top table td {
            width: 100%;
            display: block;
            text-align: center;
          }
          .invoice-box table tr.information table td {
            width: 100%;
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <table>
          <tr class="top">
            <td colspan="2">
              <table>
                <tr>
                  <td class="title">
                    <h2>Ostelflow</h2>
                  </td>
                  <td style="text-align: right;">
                    Invoice #: ${bookingId}<br />
                    Created: ${new Date().toLocaleDateString()}<br />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="information">
            <td colspan="2">
              <table>
                <tr>
                  <td>
                    ${booking.room.hotel.name}<br />
                    ${booking.room.hotel.address}<br />
                    ${booking.room.hotel.city}, ${booking.room.hotel.country}
                  </td>
                  <td style="text-align: right;">
                    ${customerName}<br />
                    ${customerEmail}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="heading">
            <td>Payment Method</td>
            <td>Status</td>
          </tr>
          <tr class="details">
            <td>${booking.paymentMethod || "Online Payment"}</td>
            <td>${booking.paymentStatus || "Completed"}</td>
          </tr>
          <tr class="heading">
            <td>Item</td>
            <td style="text-align: right;">Price</td>
          </tr>
          <tr class="item">
            <td>
              ${booking.room.name} at ${booking.room.hotel.name}<br />
              <small>Check-in: ${formatDate(
                booking.checkIn
              )} - Check-out: ${formatDate(
      booking.checkOut
    )} (${nights} nights)</small>
            </td>
            <td style="text-align: right;">$${parseFloat(
              booking.totalPrice
            ).toFixed(2)}</td>
          </tr>
          <tr class="total">
            <td></td>
            <td style="text-align: right;">Total: $${parseFloat(
              booking.totalPrice
            ).toFixed(2)}</td>
          </tr>
        </table>
        <div style="margin-top: 60px; font-size: 12px; text-align: center; color: #777;">
          <p>Thank you for your booking! We look forward to hosting you.</p>
          <p>If you have any questions, please contact us at support@ostelflow.com</p>
        </div>
      </div>
    </body>
    </html>
    `

    // Generate unique filename with timestamp
    const timestamp = new Date().getTime()
    const fileName = `invoice_${bookingId}_${timestamp}.html`
    const filePath = path.join(invoiceDir, fileName)

    // Since Puppeteer is causing issues, let's create an HTML invoice for now
    // We'll save it directly to the public directory so it can be accessed
    await fs.writeFile(filePath, invoiceHtml)

    // Return the public path to the HTML file
    return `/uploads/invoice/${fileName}`
  } catch (error) {
    console.error("Error generating invoice:", error)
    throw error
  }
}

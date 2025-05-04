"use server"

import * as React from 'react'
import { render } from '@react-email/components'
import nodemailer from 'nodemailer'
import { cars, trips, hotel, blogs, agencies, user } from '@/db/schema'
import db from "@/db/drizzle"
import { eq } from "drizzle-orm"

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Log the email configuration status (safely without exposing passwords)
if (!process.env.EMAIL_FROM) {
  console.warn("EMAIL_FROM environment variable is not set")
} else {
  console.log(`Email configuration using: ${process.env.EMAIL_FROM}`)
}

// Offer Notification Email Template
const OfferApprovalEmail = ({ 
  offerType, 
  offerName, 
  offerDestination, 
  agencyName, 
  adminViewLink 
}: { 
  offerType: string
  offerName: string
  offerDestination?: string
  agencyName: string
  adminViewLink: string
}) => {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Offer Approval Request</title>
      </head>
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        color: '#333'
      }}>
        <div style={{ 
          borderRadius: '8px', 
          overflow: 'hidden', 
          border: '1px solid #e9e9e9', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            backgroundColor: '#3b82f6', 
            padding: '24px', 
            textAlign: 'center' as const
          }}>
            <h1 style={{ color: 'white', margin: '0', fontSize: '24px' }}>
              New {offerType} Requires Approval
            </h1>
          </div>
          
          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '16px' }}>Hello Admin,</p>
            
            <div style={{
              backgroundColor: '#e6f2ff',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <p style={{ 
                fontSize: '16px', 
                margin: '0',
                fontWeight: 'bold'
              }}>
                Agency <span style={{ color: '#3b82f6' }}>{agencyName}</span> has submitted a new <span style={{ color: '#3b82f6' }}>{offerType.toUpperCase()}</span> that requires your approval.
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: '#f5f7f9', 
              padding: '16px',
              borderRadius: '6px',
              margin: '24px 0',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#3b82f6' }}>Offer Details:</h2>
              <p style={{ margin: '4px 0', fontSize: '16px' }}><strong>Name:</strong> {offerName}</p>
              {offerDestination && (
                <p style={{ margin: '4px 0', fontSize: '16px' }}><strong>Destination:</strong> {offerDestination}</p>
              )}
              <p style={{ margin: '4px 0', fontSize: '16px' }}><strong>Type:</strong> {offerType}</p>
              <p style={{ margin: '4px 0', fontSize: '16px' }}><strong>Agency:</strong> {agencyName}</p>
            </div>
            
            <div style={{ textAlign: 'center' as const, margin: '32px 0 24px' }}>
              <a 
                href={adminViewLink}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                Review Offer
              </a>
            </div>
            
            <p style={{ fontSize: '14px', color: '#666' }}>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
          
          <div style={{ 
            borderTop: '1px solid #e9e9e9', 
            padding: '16px',
            backgroundColor: '#f9fafb', 
            textAlign: 'center' as const,
            fontSize: '12px',
            color: '#666'
          }}>
            <p style={{ margin: '4px 0' }}>© {new Date().getFullYear()} Booki. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  )
}

// Approval Decision Email Template
const ApprovalDecisionEmail = ({ 
  offerType,
  offerName,
  agencyName,
  isApproved,
  rejectionReason,
  dashboardLink
}: { 
  offerType: string
  offerName: string
  agencyName: string
  isApproved: boolean
  rejectionReason?: string
  dashboardLink: string
}) => {
  // Set colors based on approval status
  const primaryColor = isApproved ? '#22c55e' : '#ef4444'
  const bgColor = isApproved ? '#f0fdf4' : '#fef2f2'
  const borderColor = isApproved ? '#86efac' : '#fecaca'
  const statusText = isApproved ? 'APPROVED' : 'REJECTED'
  
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{offerType} {statusText}</title>
      </head>
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        color: '#333'
      }}>
        <div style={{ 
          borderRadius: '8px', 
          overflow: 'hidden', 
          border: '1px solid #e9e9e9', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            backgroundColor: primaryColor, 
            padding: '24px', 
            textAlign: 'center' as const
          }}>
            <h1 style={{ color: 'white', margin: '0', fontSize: '24px' }}>
              {offerType} {statusText}
            </h1>
          </div>
          
          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '16px' }}>Hello {agencyName},</p>
            
            <div style={{
              backgroundColor: bgColor,
              padding: '16px',
              borderRadius: '6px',
              marginBottom: '20px',
              borderLeft: `4px solid ${primaryColor}`
            }}>
              <p style={{ 
                fontSize: '16px', 
                margin: '0',
                fontWeight: 'bold',
                color: primaryColor
              }}>
                {isApproved 
                  ? `Your ${offerType.toLowerCase()} "${offerName}" has been APPROVED!` 
                  : `Your ${offerType.toLowerCase()} "${offerName}" has been REJECTED.`}
              </p>
            </div>
            
            {isApproved ? (
              <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
                <p>Great news! Your {offerType.toLowerCase()} has been reviewed and approved by our team. It is now visible to customers on our platform.</p>
                <p>You can start receiving bookings immediately.</p>
              </div>
            ) : (
              <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
                <p>Unfortunately, your {offerType.toLowerCase()} has been reviewed and could not be approved at this time.</p>
                
                {rejectionReason && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    padding: '16px',
                    borderRadius: '6px',
                    margin: '16px 0',
                    border: '1px solid #fecaca'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Reason for rejection:</p>
                    <p style={{ margin: '0' }}>{rejectionReason}</p>
                  </div>
                )}
                
                <p>Please update your {offerType.toLowerCase()} addressing the concerns and submit again for review.</p>
              </div>
            )}
            
            <div style={{ textAlign: 'center' as const, margin: '32px 0 24px' }}>
              <a 
                href={dashboardLink}
                style={{
                  backgroundColor: primaryColor,
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                {isApproved ? 'View Your Dashboard' : 'Update Your Listing'}
              </a>
            </div>
            
            <p style={{ fontSize: '14px', color: '#666' }}>
              If you have any questions, please contact our support team.
            </p>
          </div>
          
          <div style={{ 
            borderTop: '1px solid #e9e9e9', 
            padding: '16px',
            backgroundColor: '#f9fafb', 
            textAlign: 'center' as const,
            fontSize: '12px',
            color: '#666'
          }}>
            <p style={{ margin: '4px 0' }}>© {new Date().getFullYear()} Booki. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  )
}

// Function to send trip approval notification to admin
export async function sendTripApprovalRequest(tripId: number) {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Get trip details
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      with: {
        agency: {
          with: {
            user: true
          }
        }
      }
    })

    if (!trip) {
      return { success: false, message: "Trip not found" }
    }

    // Prepare email data
    const adminViewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/verify-offers`
    
    // Get agency name
    let agencyName = "Agency"
    if (trip.agency) {
      agencyName = trip.agency.agencyName
    }
    
    const emailHtml = await render(
      <OfferApprovalEmail
        offerType="Trip"
        offerName={trip.name}
        offerDestination={trip.destination}
        agencyName={agencyName}
        adminViewLink={adminViewLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "youssefbenarbia345@gmail.com",
      subject: `New Trip Approval Request - ${trip.name} from ${agencyName}`,
      html: emailHtml,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending trip approval email:", error)
    return { success: false, message: "Failed to send email" }
  }
}

// Function to send car approval notification to admin
export async function sendCarApprovalRequest(carId: number) {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Get car details with agency information
    const car = await db.query.cars.findFirst({
      where: eq(cars.id, carId),
    })

    if (!car) {
      return { success: false, message: "Car not found" }
    }

    // Get agency details separately to avoid null issues
    let agencyName = "Unknown Agency"
    if (car.agencyId) {
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.userId, car.agencyId)
      })
      if (agency) {
        agencyName = agency.agencyName
      }
    }

    // Prepare email data
    const adminViewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/verify-offers`
    
    const emailHtml = await render(
      <OfferApprovalEmail
        offerType="Car"
        offerName={`${car.brand} ${car.model} (${car.year})`}
        offerDestination={car.location}
        agencyName={agencyName}
        adminViewLink={adminViewLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "youssefbenarbia345@gmail.com",
      subject: `New Car Approval Request - ${car.brand} ${car.model} from ${agencyName}`,
      html: emailHtml,
    }

    console.log("Sending car approval email to admin...")
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending car approval email:", error)
    return { success: false, message: "Failed to send email" }
  }
}

// Function to send hotel approval notification to admin
export async function sendHotelApprovalRequest(hotelId: string) {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Get hotel details
    const hotelData = await db.query.hotel.findFirst({
      where: eq(hotel.id, hotelId),
    })

    if (!hotelData) {
      return { success: false, message: "Hotel not found" }
    }

    // Get agency details separately
    let agencyName = "Unknown Agency"
    if (hotelData.agencyId) {
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.userId, hotelData.agencyId)
      })
      if (agency) {
        agencyName = agency.agencyName
      }
    }

    // Prepare email data
    const adminViewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/verify-offers`
    
    const emailHtml = await render(
      <OfferApprovalEmail
        offerType="Hotel"
        offerName={hotelData.name}
        offerDestination={`${hotelData.city}, ${hotelData.country}`}
        agencyName={agencyName}
        adminViewLink={adminViewLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "youssefbenarbia345@gmail.com",
      subject: `New Hotel Approval Request - ${hotelData.name} from ${agencyName}`,
      html: emailHtml,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending hotel approval email:", error)
    return { success: false, message: "Failed to send email" }
  }
}

// Function to send blog approval notification to admin
export async function sendBlogApprovalRequest(blogId: number) {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Get blog details
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    if (!blog) {
      return { success: false, message: "Blog not found" }
    }

    // Get agency info separately if needed
    let agencyName = "Unknown"
    if (blog?.agencyId) {
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.userId, blog.agencyId),
      })
      if (agency) {
        agencyName = agency.agencyName
      }
    } else if (blog?.authorId) {
      const author = await db.query.user.findFirst({
        where: eq(user.id, blog.authorId),
      })
      if (author) {
        agencyName = author.name || "Unknown"
      }
    }

    // Prepare email data
    const adminViewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/verify-blogs`
    
    const emailHtml = await render(
      <OfferApprovalEmail
        offerType="Blog"
        offerName={blog.title}
        agencyName={agencyName}
        adminViewLink={adminViewLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "youssefbenarbia345@gmail.com",
      subject: `New Blog Approval Request - ${blog.title}`,
      html: emailHtml,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending blog approval email:", error)
    return { success: false, message: "Failed to send email" }
  }
}

// Utility function to test sending admin emails (for debugging only)
export async function testAdminNotificationEmail() {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Prepare email data
    const adminViewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/verify-offers`
    
    const emailHtml = await render(
      <OfferApprovalEmail
        offerType="TEST"
        offerName="Test Car Offer"
        offerDestination="Test Location"
        agencyName="Test Agency"
        adminViewLink={adminViewLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "youssefbenarbia345@gmail.com",
      subject: `TEST - Admin Notification System`,
      html: emailHtml,
    }

    console.log("Sending test email to admin...")
    console.log("Using email config:", {
      from: process.env.EMAIL_FROM,
      service: "gmail"
    })
    
    const info = await transporter.sendMail(mailOptions)
    console.log("Test email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending test email:", error)
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Function to send approval decision email for trips
export async function sendTripApprovalDecisionEmail(
  tripId: number, 
  isApproved: boolean,
  rejectionReason?: string
) {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Get trip details
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      with: {
        agency: true
      }
    })

    if (!trip || !trip.agencyId) {
      return { success: false, message: "Trip or agency details not found" }
    }

    // Get agency details for contact email
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, trip.agencyId)
    })

    if (!agency) {
      return { success: false, message: "Agency details not found" }
    }

    // Get agency user as fallback email
    const agencyUser = await db.query.user.findFirst({
      where: eq(user.id, trip.agencyId)
    })

    // Use agency contactEmail if available, fall back to user email
    const recipientEmail = agency.contactEmail || agencyUser?.email
    
    if (!recipientEmail) {
      return { success: false, message: "Agency contact email not found" }
    }

    // Get agency name
    const agencyName = agency.agencyName || agencyUser?.name || 'Agency'

    // Prepare email data
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/agency/dashboard/trips`
    
    const emailHtml = await render(
      <ApprovalDecisionEmail
        offerType="Trip"
        offerName={trip.name}
        agencyName={agencyName}
        isApproved={isApproved}
        rejectionReason={rejectionReason}
        dashboardLink={dashboardLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `Trip ${isApproved ? 'Approved' : 'Rejected'} - ${trip.name}`,
      html: emailHtml,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending trip approval decision email:", error)
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Function to send approval decision email for cars
export async function sendCarApprovalDecisionEmail(
  carId: number, 
  isApproved: boolean,
  rejectionReason?: string
) {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Get car details
    const car = await db.query.cars.findFirst({
      where: eq(cars.id, carId)
    })

    if (!car || !car.agencyId) {
      return { success: false, message: "Car or agency details not found" }
    }

    // Get agency details for contact email
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, car.agencyId)
    })

    if (!agency) {
      return { success: false, message: "Agency details not found" }
    }

    // Get agency user as fallback email
    const agencyUser = await db.query.user.findFirst({
      where: eq(user.id, car.agencyId)
    })

    // Use agency contactEmail if available, fall back to user email
    const recipientEmail = agency.contactEmail || agencyUser?.email
    
    if (!recipientEmail) {
      return { success: false, message: "Agency contact email not found" }
    }
    
    const agencyName = agency.agencyName || agencyUser?.name || 'Agency'

    // Prepare email data
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/agency/dashboard/cars`
    
    const emailHtml = await render(
      <ApprovalDecisionEmail
        offerType="Car"
        offerName={`${car.brand} ${car.model} (${car.year})`}
        agencyName={agencyName}
        isApproved={isApproved}
        rejectionReason={rejectionReason}
        dashboardLink={dashboardLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `Car ${isApproved ? 'Approved' : 'Rejected'} - ${car.brand} ${car.model}`,
      html: emailHtml,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending car approval decision email:", error)
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Function to send approval decision email for hotels
export async function sendHotelApprovalDecisionEmail(
  hotelId: string, 
  isApproved: boolean,
  rejectionReason?: string
) {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Get hotel details
    const hotelData = await db.query.hotel.findFirst({
      where: eq(hotel.id, hotelId)
    })

    if (!hotelData || !hotelData.agencyId) {
      return { success: false, message: "Hotel or agency details not found" }
    }

    // Get agency details for contact email
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, hotelData.agencyId)
    })

    if (!agency) {
      return { success: false, message: "Agency details not found" }
    }

    // Get agency user as fallback email
    const agencyUser = await db.query.user.findFirst({
      where: eq(user.id, hotelData.agencyId)
    })

    // Use agency contactEmail if available, fall back to user email
    const recipientEmail = agency.contactEmail || agencyUser?.email
    
    if (!recipientEmail) {
      return { success: false, message: "Agency contact email not found" }
    }
    
    const agencyName = agency.agencyName || agencyUser?.name || 'Agency'

    // Prepare email data
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/agency/dashboard/hotels`
    
    const emailHtml = await render(
      <ApprovalDecisionEmail
        offerType="Hotel"
        offerName={hotelData.name}
        agencyName={agencyName}
        isApproved={isApproved}
        rejectionReason={rejectionReason}
        dashboardLink={dashboardLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `Hotel ${isApproved ? 'Approved' : 'Rejected'} - ${hotelData.name}`,
      html: emailHtml,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending hotel approval decision email:", error)
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Function to send approval decision email for blogs
export async function sendBlogApprovalDecisionEmail(
  blogId: number, 
  isApproved: boolean,
  rejectionReason?: string
) {
  try {
    // Check for email config
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration is missing")
      return { success: false, message: "Email configuration is missing" }
    }

    // Get blog details
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId)
    })

    if (!blog) {
      return { success: false, message: "Blog not found" }
    }

    let recipientEmail: string | null = null
    let creatorName = "Author"

    // If blog is from agency, prioritize agency contact email
    if (blog.agencyId) {
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.userId, blog.agencyId)
      })
      
      if (agency) {
        creatorName = agency.agencyName
        recipientEmail = agency.contactEmail // Get agency contact email

        // If no contactEmail, fall back to user email
        if (!recipientEmail) {
          const agencyUser = await db.query.user.findFirst({
            where: eq(user.id, blog.agencyId)
          })
          if (agencyUser?.email) {
            recipientEmail = agencyUser.email
          }
        }
      }
    } 
    
    // If no agency or agency email not found, try author
    if (!recipientEmail && blog.authorId) {
      const author = await db.query.user.findFirst({
        where: eq(user.id, blog.authorId)
      })
      
      if (author) {
        creatorName = author.name
        recipientEmail = author.email
      }
    }

    if (!recipientEmail) {
      return { success: false, message: "No recipient email found for blog" }
    }

    // Prepare email data
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/agency/dashboard/blogs`
    
    const emailHtml = await render(
      <ApprovalDecisionEmail
        offerType="Blog"
        offerName={blog.title}
        agencyName={creatorName}
        isApproved={isApproved}
        rejectionReason={rejectionReason}
        dashboardLink={dashboardLink}
      />
    )

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `Blog ${isApproved ? 'Approved' : 'Rejected'} - ${blog.title}`,
      html: emailHtml,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending blog approval decision email:", error)
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
} 
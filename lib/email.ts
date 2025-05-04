import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'youssefbenarbia345@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'youssefbenarbia32@gmail.com';

// Configure email transporter
let transporter: nodemailer.Transporter;

// Initialize transporter
const initTransporter = async () => {
  // In development/test use Ethereal test account if no credentials provided
  if ((!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) && process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  
  // Use Gmail transporter with provided credentials
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Function to get or create transporter
const getTransporter = async () => {
  if (!transporter) {
    transporter = await initTransporter();
  }
  return transporter;
};

// Types
interface EmailPayload {
  to: string;
  subject: string;
  react?: ReactElement;
  text?: string;
  html?: string;
}

/**
 * Send an email using either React components or plain HTML/text
 */
export async function sendEmail({ to, subject, react, text, html }: EmailPayload) {
  try {
    const transporter = await getTransporter();
    
    // Use either the provided html or an empty string
    let finalHtml = html || '';
    
    // If React component is provided, render it to HTML
    if (react) {
      // Either synchronous render (string) or asynchronous render (Promise<string>)
      try {
        const renderedReact = render(react);
        // If it's a Promise, await it
        if (renderedReact instanceof Promise) {
          finalHtml = await renderedReact;
        } else {
          finalHtml = renderedReact;
        }
      } catch (error) {
        console.error('Error rendering React component:', error);
        // Fall back to text content if rendering fails
      }
    }
    
    const mailOptions = {
      from: EMAIL_FROM,
      to: to.toLowerCase().trim(),
      subject: subject.trim(),
      text: text?.trim() || '',
      html: finalHtml,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // For development, log the preview URL for Ethereal
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_FROM) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email.' };
  }
}

// Admin email getter
export const getAdminEmail = () => ADMIN_EMAIL; 
import nodemailer from 'nodemailer';

// Admin email for verification notifications
const ADMIN_EMAIL = 'youssefbenabia32@gmail.com';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Configure email transporter
// Note: In production, use proper SMTP credentials
// For now using a test account
const getTransporter = async () => {
  // In development/test use Ethereal test account
  if (process.env.NODE_ENV !== 'production') {
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
  
  // In production, use your actual SMTP service
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

export async function sendEmail({ to, subject, text, html }: EmailPayload) {
  const transporter = await getTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@booki.com',
    to,
    subject,
    text,
    html,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    
    // For development, log the preview URL for Ethereal
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Function to notify admin about new document submission
export async function notifyAdminOfDocumentSubmission(agencyData: {
  agencyName: string;
  agencyId: number;
  contactEmail: string;
  rneDocument?: string;
  patenteDocument?: string;
  cinDocument?: string;
}) {
  const { agencyName, agencyId, contactEmail, rneDocument, patenteDocument, cinDocument } = agencyData;
  
  // Build list of submitted documents
  const submittedDocs = [
    rneDocument ? 'RNE Document' : null,
    patenteDocument ? 'Patente Document' : null,
    cinDocument ? 'CIN Document' : null,
  ].filter(Boolean).join(', ');
  
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Verification Documents Submitted - ${agencyName}`,
    text: `
      Hello Admin,
      
      A new verification document submission requires your review.
      
      Agency: ${agencyName}
      Agency ID: ${agencyId}
      Contact Email: ${contactEmail}
      
      Documents Submitted: ${submittedDocs}
      
      Please review these documents in the admin panel at your earliest convenience.
      
      Direct link to review: /admin/agencies/${agencyId}
      
      Thank you,
      The Booki System
    `,
    html: `
      <h2>New Verification Documents Submitted</h2>
      <p>Hello Admin,</p>
      <p>A new verification document submission requires your review.</p>
      
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #ddd;">
        <tr style="background-color: #f8f8f8;">
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Agency</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd;">${agencyName}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Agency ID</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd;">${agencyId}</td>
        </tr>
        <tr style="background-color: #f8f8f8;">
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Contact Email</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd;">${contactEmail}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Documents Submitted</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd;">${submittedDocs}</td>
        </tr>
      </table>
      
      <p>Please review these documents in the admin panel at your earliest convenience.</p>
      
      <p style="margin: 30px 0;">
        <a href="/admin/agencies/${agencyId}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">Review Submission</a>
      </p>
      
      <p>Thank you,<br>The Booki System</p>
    `,
  });
} 
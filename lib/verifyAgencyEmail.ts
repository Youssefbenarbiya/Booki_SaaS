import nodemailer from 'nodemailer';

// Admin email for verification notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'youssefbenarbia32@gmail.com';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to notify admin about new document submission
export async function notifyAdminOfDocumentSubmission(agencyData: {
  agencyName: string;
  agencyId: number;
  contactEmail: string;
  isResubmission?: boolean;
  rneDocument?: string;
  patenteDocument?: string;
  cinDocument?: string;
}) {
  const { agencyName, agencyId, contactEmail, rneDocument, patenteDocument, cinDocument, isResubmission } = agencyData;
  
  // Build list of submitted documents
  const submittedDocs = [
    rneDocument ? 'RNE Document' : null,
    patenteDocument ? 'Patente Document' : null,
    cinDocument ? 'CIN Document' : null,
  ].filter(Boolean).join(', ');
  
  let actionType = 'verification documents';
  if (isResubmission) {
    actionType = 'resubmitted verification documents after a previous rejection';
  }
  
  const emailSubject = isResubmission 
    ? `[URGENT] Resubmitted Verification Documents - ${agencyName}` 
    : `[ACTION REQUIRED] Document Verification For - ${agencyName}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booki.com';

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: emailSubject,
    text: `
      Hello Admin,
      
      An agency has updated their ${actionType} that require your review.
      
      Agency: ${agencyName}
      Agency ID: ${agencyId}
      Contact Email: ${contactEmail}
      
      Documents Submitted: ${submittedDocs}
      
      Please review these documents in the admin panel at your earliest convenience.
      
      Direct link to review: ${baseUrl}/admin/agencies/${agencyId}
      
      Thank you,
      The Booki System
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isResubmission ? 'Resubmitted' : 'New'} Verification Documents</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${isResubmission ? '#fff3cd' : '#d1e7dd'}; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .header h2 { margin: 0; color: ${isResubmission ? '#856404' : '#0f5132'}; font-size: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table th, table td { padding: 12px; text-align: left; border: 1px solid #ddd; }
          table th { background-color: #f8f9fa; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .highlight { background-color: #fff3cd; font-weight: bold; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 14px; color: #6c757d; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${isResubmission ? '⚠️ Resubmitted Documents After Rejection' : '📄 New Document Verification Required'}</h2>
          </div>
          
          <p>Hello Admin,</p>
          
          <p>An agency has ${isResubmission ? '<strong>resubmitted</strong>' : 'updated their'} verification documents that require your review.</p>
          
          <table>
            <tr>
              <th>Agency</th>
              <td>${agencyName}</td>
            </tr>
            <tr>
              <th>Agency ID</th>
              <td>${agencyId}</td>
            </tr>
            <tr>
              <th>Contact Email</th>
              <td>${contactEmail}</td>
            </tr>
            <tr>
              <th>Documents Submitted</th>
              <td>${submittedDocs}</td>
            </tr>
            ${isResubmission ? `
            <tr class="highlight">
              <th>Submission Type</th>
              <td>Resubmission after rejection</td>
            </tr>
            ` : ''}
          </table>
          
          <p><strong>Action Required:</strong> Please review these documents in the admin panel at your earliest convenience.</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/admin/agencies/${agencyId}" class="btn">Review Documents Now</a>
          </p>
          
          <div class="footer">
            <p>Thank you,<br>The Booki System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

// Function to send verification approval email to agency
export async function sendVerificationApprovalEmail(agencyData: {
  agencyName: string;
  contactEmail: string;
}) {
  const { agencyName, contactEmail } = agencyData;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booki.com';
  
  return sendEmail({
    to: contactEmail,
    subject: "Verification Approved - Your Agency is Now Verified",
    text: `
      Dear ${agencyName},
      
      Congratulations! Your agency verification documents have been reviewed and approved.
      
      Your agency is now fully verified and can operate without restrictions on our platform.
      
      Thank you for completing the verification process.
      
      Best regards,
      The Booki Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 5px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/images/logo.png" alt="Booki Logo" style="max-width: 120px; height: auto;"/>
        </div>
        
        <h2 style="color: #333; font-size: 24px;">Verification Approved!</h2>
        
        <p>Dear ${agencyName},</p>
        
        <div style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #22c55e; margin: 15px 0;">
          <p style="margin: 0; color: #166534;">Congratulations! Your agency verification documents have been reviewed and approved.</p>
        </div>
        
        <p>Your agency is now fully verified and can operate without restrictions on our platform.</p>
        
        <p>Thank you for completing the verification process.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/agency/dashboard" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
        </div>
        
        <hr style="border-color: #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 14px;">Best regards,<br>The Booki Team</p>
      </div>
    `,
  });
}

// Function to send verification rejection email to agency
export async function sendVerificationRejectionEmail(agencyData: {
  agencyName: string;
  contactEmail: string;
  rejectionReason: string;
}) {
  const { agencyName, contactEmail, rejectionReason } = agencyData;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booki.com';
  
  return sendEmail({
    to: contactEmail,
    subject: "Verification Update - Additional Information Required",
    text: `
      Dear ${agencyName},
      
      Thank you for submitting your verification documents.
      
      After review, we need some additional information or corrections before we can approve your verification:
      
      ${rejectionReason}
      
      Please update your documents in your agency profile and resubmit them for verification.
      
      If you have any questions, please contact our support team.
      
      Best regards,
      The Booki Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 5px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/images/logo.png" alt="Booki Logo" style="max-width: 120px; height: auto;"/>
        </div>
        
        <h2 style="color: #333; font-size: 24px;">Verification Update</h2>
        
        <p>Dear ${agencyName},</p>
        
        <p>Thank you for submitting your verification documents.</p>
        
        <p>After review, we need some additional information or corrections before we can approve your verification:</p>
        
        <div style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #e74c3c; margin: 15px 0;">
          <p style="margin: 0;">${rejectionReason}</p>
        </div>
        
        <p>Please update your documents in your agency profile and resubmit them for verification.</p>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/agency/profile" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Update Documents</a>
        </div>
        
        <hr style="border-color: #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 14px;">Best regards,<br>The Booki Team</p>
      </div>
    `,
  });
}

// Helper function to send emails
async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email configuration is not set.");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to.toLowerCase().trim(),
    subject: subject.trim(),
    text: text.trim(),
    html: html.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email." };
  }
} 
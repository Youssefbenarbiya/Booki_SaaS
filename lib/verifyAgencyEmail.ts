import nodemailer from 'nodemailer';

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
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booki.com';

// Styles
const main = {
  backgroundColor: '#f9f9f9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const logoContainer = {
  padding: '20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  backgroundColor: '#ffffff',
  padding: '30px 40px',
  borderRadius: '5px',
  border: '1px solid #e5e7eb',
};

const headingStyle = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#333',
  margin: '0 0 20px',
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#444',
  margin: '0 0 15px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 30px',
};

const footerTextStyle = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666',
};

const highlightBox = {
  padding: '15px',
  backgroundColor: '#f8f8f8',
  borderLeft: '4px solid #e74c3c',
  margin: '15px 0',
};

const successBox = {
  padding: '15px',
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #22c55e',
  margin: '15px 0',
};

const tableContainer = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  margin: '20px 0',
  border: '1px solid #ddd',
};

const tableRow = {
  backgroundColor: '#f8f8f8',
};

const tableCellHeader = {
  padding: '12px',
  border: '1px solid #ddd',
  fontWeight: 'bold',
};

const tableCell = {
  padding: '12px',
  border: '1px solid #ddd',
};

// Email Templates

// 1. Agency Verification Approved Email
interface VerificationApprovedProps {
  agencyName: string;
}

export const AgencyVerificationApproved: React.FC<VerificationApprovedProps> = ({ 
  agencyName 
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your Agency Verification Has Been Approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/images/logo.png`}
              width="120"
              height="40"
              alt="Booki"
              style={logo}
            />
          </Section>
          
          <Section style={content}>
            <Heading style={headingStyle}>Verification Approved!</Heading>
            
            <Text style={textStyle}>Dear {agencyName},</Text>
            
            <Section style={successBox}>
              <Text style={{...textStyle, color: '#166534', margin: 0}}>
                Congratulations! Your agency verification documents have been reviewed and approved.
              </Text>
            </Section>
            
            <Text style={textStyle}>
              Your agency is now fully verified and can operate without restrictions on our platform.
            </Text>
            
            <Text style={textStyle}>
              Thank you for completing the verification process.
            </Text>
            
            <Section style={buttonContainer}>
              <Link 
                href={`${baseUrl}/agency/dashboard`}
                style={button}
              >
                Go to Dashboard
              </Link>
            </Section>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerTextStyle}>Best regards,</Text>
            <Text style={footerTextStyle}>The Booki Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// 2. Agency Verification Rejected Email
interface VerificationRejectedProps {
  agencyName: string;
  rejectionReason: string;
}

export const AgencyVerificationRejected: React.FC<VerificationRejectedProps> = ({ 
  agencyName,
  rejectionReason
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verification Update - Additional Information Required</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/images/logo.png`}
              width="120"
              height="40"
              alt="Booki"
              style={logo}
            />
          </Section>
          
          <Section style={content}>
            <Heading style={headingStyle}>Verification Update</Heading>
            
            <Text style={textStyle}>Dear {agencyName},</Text>
            
            <Text style={textStyle}>
              Thank you for submitting your verification documents.
            </Text>
            
            <Text style={textStyle}>
              After review, we need some additional information or corrections before we can approve your verification:
            </Text>
            
            <Section style={highlightBox}>
              <Text style={{...textStyle, margin: 0}}>
                {rejectionReason}
              </Text>
            </Section>
            
            <Text style={textStyle}>
              Please update your documents in your agency profile and resubmit them for verification.
            </Text>
            
            <Text style={textStyle}>
              If you have any questions, please contact our support team.
            </Text>
            
            <Section style={buttonContainer}>
              <Link 
                href={`${baseUrl}/agency/profile`}
                style={button}
              >
                Update Documents
              </Link>
            </Section>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerTextStyle}>Best regards,</Text>
            <Text style={footerTextStyle}>The Booki Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// 3. Admin Notification for Document Submission
interface AdminNotificationProps {
  agencyName: string;
  agencyId: number;
  contactEmail: string;
  submittedDocs: string;
  isResubmission: boolean;
}

export const AdminDocumentSubmissionNotification: React.FC<AdminNotificationProps> = ({ 
  agencyName,
  agencyId,
  contactEmail,
  submittedDocs,
  isResubmission
}) => {
  const submissionType = isResubmission 
    ? 'resubmitted verification documents after a previous rejection' 
    : 'new verification documents';
    
  return (
    <Html>
      <Head />
      <Preview>{isResubmission ? 'Resubmitted' : 'New'} Verification Documents - {agencyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/images/logo.png`}
              width="120"
              height="40"
              alt="Booki"
              style={logo}
            />
          </Section>
          
          <Section style={content}>
            <Heading style={headingStyle}>
              {isResubmission ? 'Resubmitted' : 'New'} Verification Documents
            </Heading>
            
            <Text style={textStyle}>Hello Admin,</Text>
            
            <Text style={textStyle}>
              An agency has {submissionType} that require your review.
            </Text>
            
            <table style={tableContainer}>
              <tbody>
                <tr style={tableRow}>
                  <td style={tableCellHeader}>Agency</td>
                  <td style={tableCell}>{agencyName}</td>
                </tr>
                <tr>
                  <td style={tableCellHeader}>Agency ID</td>
                  <td style={tableCell}>{agencyId}</td>
                </tr>
                <tr style={tableRow}>
                  <td style={tableCellHeader}>Contact Email</td>
                  <td style={tableCell}>{contactEmail}</td>
                </tr>
                <tr>
                  <td style={tableCellHeader}>Documents Submitted</td>
                  <td style={tableCell}>{submittedDocs}</td>
                </tr>
                {isResubmission && (
                  <tr style={{backgroundColor: '#f8fcf0'}}>
                    <td style={tableCellHeader}>Submission Type</td>
                    <td style={{...tableCell, color: '#e67e22', fontWeight: 'bold'}}>
                      Resubmission after rejection
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <Text style={textStyle}>
              Please review these documents in the admin panel at your earliest convenience.
            </Text>
            
            <Section style={buttonContainer}>
              <Link 
                href={`${baseUrl}/admin/agencies/${agencyId}`}
                style={button}
              >
                Review Submission
              </Link>
            </Section>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerTextStyle}>Thank you,</Text>
            <Text style={footerTextStyle}>The Booki System</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}; 
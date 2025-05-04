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
  Column,
  Row,
} from '@react-email/components';

interface EmailTemplateProps {
  previewText: string;
  heading: string;
  children: React.ReactNode;
  ctaText?: string;
  ctaLink?: string;
  footerText?: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  previewText,
  heading,
  children,
  ctaText,
  ctaLink,
  footerText = 'The Booki Team',
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booki.com';
  
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
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
            <Heading style={heading}>{heading}</Heading>
            {children}
            
            {ctaText && ctaLink && (
              <Section style={buttonContainer}>
                <Link style={button} href={ctaLink}>
                  {ctaText}
                </Link>
              </Section>
            )}
          </Section>
          
          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>Best regards,</Text>
            <Text style={footerText}>{footerText}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

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

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#333',
  margin: '0 0 20px',
};

const text = {
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
  transition: 'background-color 0.3s',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 30px',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666',
}; 
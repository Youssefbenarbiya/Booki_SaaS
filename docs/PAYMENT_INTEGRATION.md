# Flouci Payment Integration

This document provides information on how the Flouci payment gateway has been integrated into the application.

## Overview

The application uses Flouci's payment API to process payments for room bookings. The integration follows these steps:

1. User fills out the booking form and submits it
2. The application creates a booking record with a "pending" status
3. The application generates a payment link using the Flouci API
4. The user is redirected to the Flouci payment page
5. After completing or canceling the payment, the user is redirected back to the application
6. The application updates the booking status based on the payment result

## Configuration

The Flouci API credentials are configured in the `services/flouciPayment.ts` file:

```typescript
// Flouci API configuration
const FLOUCI_API_URL = "https://developers.flouci.com/api"
const APP_TOKEN = "8604b867-9238-4083-8b76-a116f3c6b1a2"
const APP_SECRET = "bc9ff7c5-31d9-4d2a-83ad-a71ae68aad2f"
```

In a production environment, these values should be stored in environment variables:

```typescript
const APP_TOKEN = process.env.FLOUCI_APP_TOKEN
const APP_SECRET = process.env.FLOUCI_APP_SECRET
```

## Database Schema

The `roomBookings` table has been extended with the following fields to support payment tracking:

- `paymentId`: The ID of the payment in the Flouci system
- `paymentStatus`: The status of the payment (pending, completed, failed)
- `paymentMethod`: The payment method used (e.g., flouci, card)
- `paymentDate`: The date and time when the payment was processed

## API Endpoints

The application includes the following API endpoints for payment processing:

- `GET /api/payment/verify`: Verifies the status of a payment

## Payment Flow

1. **Booking Creation**:
   - When a user submits the booking form, the `createRoomBooking` function is called
   - This function creates a booking record and generates a payment link
   - The user is redirected to the Flouci payment page

2. **Payment Processing**:
   - The user completes the payment on the Flouci platform
   - Flouci redirects the user back to the application using the success or failure URL

3. **Payment Verification**:
   - The success/failure pages update the booking status based on the payment result
   - The application can also verify the payment status using the `/api/payment/verify` endpoint

4. **Booking Status Update**:
   - The `updateBookingPaymentStatus` function updates the booking status based on the payment result

## Testing

To test the payment integration:

1. Create a booking by filling out the booking form
2. You will be redirected to the Flouci payment page
3. Use the Flouci test credentials to complete or cancel the payment
4. You will be redirected back to the application
5. Check the booking status in the dashboard

## Troubleshooting

If you encounter issues with the payment integration:

1. Check the browser console for error messages
2. Verify that the Flouci API credentials are correct
3. Ensure that the success and failure URLs are properly configured
4. Check the server logs for any errors during payment processing

## Resources

- [Flouci API Documentation](https://app.flouci.com)
- [Flouci Developer Portal](https://app.flouci.com) 
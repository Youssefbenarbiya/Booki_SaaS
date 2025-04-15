-- Add currency fields to room_bookings table
ALTER TABLE room_bookings
ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10),
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(10),
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS adult_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS infant_count INTEGER DEFAULT 0;

-- Comment
COMMENT ON COLUMN room_bookings.payment_currency IS 'Currency used for payment (USD for Stripe, TND for Flouci)';
COMMENT ON COLUMN room_bookings.original_currency IS 'Original currency of the room price';
COMMENT ON COLUMN room_bookings.original_price IS 'Original price in the room currency';
COMMENT ON COLUMN room_bookings.adult_count IS 'Number of adults in the booking';
COMMENT ON COLUMN room_bookings.child_count IS 'Number of children in the booking';
COMMENT ON COLUMN room_bookings.infant_count IS 'Number of infants in the booking'; 
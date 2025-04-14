"use server"

// Fixed exchange rates for currency conversion
// These fixed rates will be used for currency conversion
const EXCHANGE_RATES = {
  // Base rates relative to USD
  USD: {
    TND: 3.125, // 1 USD = 3.125 TND
    EUR: 0.92,  // 1 USD = 0.92 EUR
    GBP: 0.78,  // 1 USD = 0.78 GBP
    JPY: 154.5, // 1 USD = 154.5 JPY
    CAD: 1.37,  // 1 USD = 1.37 CAD
    AUD: 1.51   // 1 USD = 1.51 AUD
  },
  // Base rates relative to TND
  TND: {
    USD: 0.32, // 1 TND = 0.32 USD
    EUR: 0.29, // 1 TND = 0.29 EUR
    GBP: 0.25, // 1 TND = 0.25 GBP
    JPY: 48.5, // 1 TND = 48.5 JPY
    CAD: 0.44, // 1 TND = 0.44 CAD
    AUD: 0.48  // 1 TND = 0.48 AUD
  }
}

/**
 * Converts an amount from one currency to another
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency code
 * @param toCurrency - The target currency code
 * @returns The converted amount
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  // If source and target currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount
  }

  try {
    // Try to fetch latest rates from an external API (you could add this later)
    // For now, use our fixed rates
    
    // Direct conversion if rates exist
    if (EXCHANGE_RATES[fromCurrency]?.[toCurrency]) {
      return amount * EXCHANGE_RATES[fromCurrency][toCurrency]
    }
    
    // If direct conversion not available, try via USD as base currency
    if (EXCHANGE_RATES.USD[fromCurrency] && EXCHANGE_RATES.USD[toCurrency]) {
      // Convert to USD first, then to target currency
      const amountInUSD = amount / EXCHANGE_RATES.USD[fromCurrency]
      return amountInUSD * EXCHANGE_RATES.USD[toCurrency]
    }
    
    // If USD path not available, try via TND
    if (EXCHANGE_RATES.TND[fromCurrency] && EXCHANGE_RATES.TND[toCurrency]) {
      // Convert to TND first, then to target currency
      const amountInTND = amount / EXCHANGE_RATES.TND[fromCurrency]
      return amountInTND * EXCHANGE_RATES.TND[toCurrency]
    }
    
    // If no conversion path is found, return original amount
    console.warn(`No conversion rate found for ${fromCurrency} to ${toCurrency}`)
    return amount
  } catch (error) {
    console.error("Error converting currency:", error)
    // Return original amount on error
    return amount
  }
} 
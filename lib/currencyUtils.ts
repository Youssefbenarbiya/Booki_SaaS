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
  },
  // Add EUR as another base currency
  EUR: {
    USD: 1.09,  // 1 EUR = 1.09 USD
    TND: 3.45,  // 1 EUR = 3.45 TND
    GBP: 0.85,  // 1 EUR = 0.85 GBP
    JPY: 168.2, // 1 EUR = 168.2 JPY
    CAD: 1.49,  // 1 EUR = 1.49 CAD
    AUD: 1.65   // 1 EUR = 1.65 AUD
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
  // Log the conversion request
  console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);
  
  // If source and target currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    console.log(`Same currency (${fromCurrency}), no conversion needed`);
    return amount;
  }

  try {
    // Normalize currency codes to uppercase
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    
    console.log(`Normalized currencies: ${from} to ${to}`);
    
    // Direct conversion if rates exist
    if (EXCHANGE_RATES[from]?.[to]) {
      const result = amount * EXCHANGE_RATES[from][to];
      console.log(`Direct conversion: ${amount} ${from} = ${result} ${to} (rate: ${EXCHANGE_RATES[from][to]})`);
      return result;
    }
    
    // If direct conversion not available, try via USD as base currency
    if (EXCHANGE_RATES.USD[from] && EXCHANGE_RATES.USD[to]) {
      // Convert to USD first, then to target currency
      const amountInUSD = amount / EXCHANGE_RATES.USD[from];
      const result = amountInUSD * EXCHANGE_RATES.USD[to];
      console.log(`USD conversion: ${amount} ${from} → ${amountInUSD} USD → ${result} ${to}`);
      console.log(`Rates used: ${from} to USD: ${1/EXCHANGE_RATES.USD[from]}, USD to ${to}: ${EXCHANGE_RATES.USD[to]}`);
      return result;
    }
    
    // If USD path not available, try via EUR
    if (EXCHANGE_RATES.EUR[from] && EXCHANGE_RATES.EUR[to]) {
      // Convert to EUR first, then to target currency
      const amountInEUR = amount / EXCHANGE_RATES.EUR[from];
      const result = amountInEUR * EXCHANGE_RATES.EUR[to];
      console.log(`EUR conversion: ${amount} ${from} → ${amountInEUR} EUR → ${result} ${to}`);
      console.log(`Rates used: ${from} to EUR: ${1/EXCHANGE_RATES.EUR[from]}, EUR to ${to}: ${EXCHANGE_RATES.EUR[to]}`);
      return result;
    }
    
    // If EUR path not available, try via TND
    if (EXCHANGE_RATES.TND[from] && EXCHANGE_RATES.TND[to]) {
      // Convert to TND first, then to target currency
      const amountInTND = amount / EXCHANGE_RATES.TND[from];
      const result = amountInTND * EXCHANGE_RATES.TND[to];
      console.log(`TND conversion: ${amount} ${from} → ${amountInTND} TND → ${result} ${to}`);
      console.log(`Rates used: ${from} to TND: ${1/EXCHANGE_RATES.TND[from]}, TND to ${to}: ${EXCHANGE_RATES.TND[to]}`);
      return result;
    }
    
    // Special case for EUR to USD conversion (important for payment processing)
    if (from === 'EUR' && to === 'USD') {
      const result = amount * 1.09; // 1 EUR = 1.09 USD
      console.log(`Special EUR→USD: ${amount} EUR = ${result} USD (rate: 1.09)`);
      return result;
    }
    
    // Special case for USD to EUR conversion
    if (from === 'USD' && to === 'EUR') {
      const result = amount * 0.92; // 1 USD = 0.92 EUR
      console.log(`Special USD→EUR: ${amount} USD = ${result} EUR (rate: 0.92)`);
      return result;
    }
    
    // Special case for EUR to TND conversion
    if (from === 'EUR' && to === 'TND') {
      const result = amount * 3.45; // 1 EUR = 3.45 TND
      console.log(`Special EUR→TND: ${amount} EUR = ${result} TND (rate: 3.45)`);
      return result;
    }
    
    // Special case for TND to EUR conversion
    if (from === 'TND' && to === 'EUR') {
      const result = amount * 0.29; // 1 TND = 0.29 EUR
      console.log(`Special TND→EUR: ${amount} TND = ${result} EUR (rate: 0.29)`);
      return result;
    }
    
    // If no conversion path is found, return original amount
    console.warn(`No conversion rate found for ${from} to ${to}`);
    return amount;
  } catch (error) {
    console.error("Error converting currency:", error);
    // Return original amount on error
    return amount;
  }
} 
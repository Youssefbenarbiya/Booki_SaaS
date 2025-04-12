"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (amount: number | string, fromCurrency?: string) => number;
  rates: Record<string, number>;
  isLoading: boolean;
};

const defaultContext: CurrencyContextType = {
  currency: "USD",
  setCurrency: () => {},
  convertPrice: () => 0,
  rates: {},
  isLoading: true,
};

const CurrencyContext = createContext<CurrencyContextType>(defaultContext);

export const useCurrency = () => useContext(CurrencyContext);

// Fixed exchange rates for TND to various currencies
// These fixed rates will be used if the API doesn't provide them
const FIXED_TND_RATES = {
  USD: 0.32, // 1 TND = 0.32 USD
  EUR: 0.29, // 1 TND = 0.29 EUR
  GBP: 0.25, // 1 TND = 0.25 GBP
  JPY: 48.5,  // 1 TND = 48.5 JPY
  CAD: 0.44, // 1 TND = 0.44 CAD
  AUD: 0.48  // 1 TND = 0.48 AUD
};

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [apiBaseCurrency, setApiBaseCurrency] = useState<string>("USD");

  // Fetch rates on mount and when currency changes
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        // Fetch exchange rates with EUR as base (since Frankfurter API supports EUR well)
        const apiBaseCurrency = "EUR";
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${apiBaseCurrency}`);
        const data = await response.json();
        
        // Store the API's base currency
        setApiBaseCurrency(apiBaseCurrency);
        
        // Create a normalized rates object where all rates are relative to EUR
        const apiRates = { ...data.rates };
        
        // Add the base currency to rates with value 1
        apiRates[apiBaseCurrency] = 1;
        
        // Add fixed TND rates if TND is missing in the API response
        if (!apiRates.TND) {
          // We know the rate from TND to EUR, so we can calculate
          // EUR to TND rate is 1/0.29 = 3.45
          apiRates.TND = 1 / FIXED_TND_RATES.EUR;
        }
        
        setRates(apiRates);
      } catch (error) {
        console.error("Error fetching currency rates:", error);
        
        // Fallback: Set some basic rates relative to EUR as base
        const fallbackRates: Record<string, number> = {
          EUR: 1,
          USD: 1.09,
          GBP: 0.86,
          JPY: 167.5,
          TND: 3.45, // 1 EUR = 3.45 TND
          CAD: 1.48,
          AUD: 1.65
        };
        
        setApiBaseCurrency("EUR");
        setRates(fallbackRates);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Convert price from source currency to the selected currency
  const convertPrice = (amount: number | string, fromCurrency = "USD"): number => {
    if (!amount) return 0;
    
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) return 0;
    
    // If the source and target currencies are the same, no conversion needed
    if (fromCurrency === currency) return numericAmount;
    
    try {
      // SIMPLIFIED CONVERSION ALGORITHM:
      // 1. Convert fromCurrency to API base currency (EUR in our case)
      // 2. Convert from API base currency to target currency
      
      // Special handling for TND which might not be in the API
      if (fromCurrency === "TND" && currency === "EUR") {
        // Direct conversion from TND to EUR
        return numericAmount * FIXED_TND_RATES.EUR;
      } else if (fromCurrency === "EUR" && currency === "TND") {
        // Direct conversion from EUR to TND
        return numericAmount * (1 / FIXED_TND_RATES.EUR);
      } else if (fromCurrency === "TND") {
        // Two-step conversion: TND -> EUR -> target currency
        const amountInEur = numericAmount * FIXED_TND_RATES.EUR;
        return amountInEur * (rates[currency] || 1);
      } else if (currency === "TND") {
        // Two-step conversion: source currency -> EUR -> TND
        const amountInEur = fromCurrency === "EUR" ? numericAmount : numericAmount / (rates[fromCurrency] || 1);
        return amountInEur * (1 / FIXED_TND_RATES.EUR);
      } else {
        // Standard conversion through EUR as intermediate
        // First convert to EUR
        const amountInBaseCurrency = fromCurrency === apiBaseCurrency 
          ? numericAmount 
          : numericAmount / (rates[fromCurrency] || 1);
        
        // Then convert from EUR to target currency
        return amountInBaseCurrency * (rates[currency] || 1);
      }
    } catch (error) {
      console.error("Error converting currency:", error, {
        fromCurrency,
        toCurrency: currency,
        amount: numericAmount,
        rates
      });
      return numericAmount; // Return original amount on error
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, rates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}; 
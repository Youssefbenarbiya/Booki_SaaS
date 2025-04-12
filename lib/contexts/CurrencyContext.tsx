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

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch rates on mount and when currency changes
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${currency}`);
        const data = await response.json();
        
        // Create a copy of the rates for modification
        const updatedRates = { ...data.rates };
        
        // Add the base currency to rates with value 1
        updatedRates[currency] = 1;
        
        // Add Tunisian Dinar if it's not in the API response
        // Using an approximate rate - this should be updated with real-time data if possible
        if (!updatedRates.TND) {
          // If TND is the current currency, set its rate to 1
          if (currency === "TND") {
            updatedRates.USD = 0.32; // Approximate: 1 TND ≈ 0.32 USD
            updatedRates.EUR = 0.29; // Approximate: 1 TND ≈ 0.29 EUR
          } else if (currency === "USD") {
            updatedRates.TND = 3.13; // Approximate: 1 USD ≈ 3.13 TND
          } else if (currency === "EUR") {
            updatedRates.TND = 3.47; // Approximate: 1 EUR ≈ 3.47 TND
          } else {
            // For other base currencies, calculate an approximate TND rate
            // This is simplified and not exact
            const usdRate = updatedRates.USD || 1;
            updatedRates.TND = usdRate * 3.13;
          }
        }
        
        setRates(updatedRates);
      } catch (error) {
        console.error("Error fetching currency rates:", error);
        
        // Fallback: Set some basic rates including TND
        const fallbackRates: Record<string, number> = {
          [currency]: 1,
        };
        
        if (currency === "USD") {
          fallbackRates.EUR = 0.91;
          fallbackRates.TND = 3.13;
        } else if (currency === "EUR") {
          fallbackRates.USD = 1.09;
          fallbackRates.TND = 3.47;
        } else if (currency === "TND") {
          fallbackRates.USD = 0.32;
          fallbackRates.EUR = 0.29;
        }
        
        setRates(fallbackRates);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [currency]);

  // Convert price from USD (or specified currency) to the selected currency
  const convertPrice = (amount: number | string, fromCurrency = "USD"): number => {
    if (!amount) return 0;
    
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) return 0;
    if (fromCurrency === currency) return numericAmount;
    
    // If we're converting from a currency that's not our current base
    // We need to first convert to the base currency, then to the target
    if (fromCurrency !== currency) {
      // Direct conversion if we have the rate
      if (rates[fromCurrency]) {
        return numericAmount / rates[fromCurrency];
      }
      
      // If we don't have the rate for this currency pair, return the original amount
      return numericAmount;
    }
    
    return numericAmount;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, rates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}; 
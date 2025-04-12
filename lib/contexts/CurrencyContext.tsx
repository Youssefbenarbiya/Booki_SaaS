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
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");

  // Fetch rates on mount and when currency changes
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        // Fetch exchange rates with the user's selected currency as the base
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${currency}`);
        const data = await response.json();
        
        // Store the base currency from the API response
        setBaseCurrency(currency);
        
        // Create a copy of the rates for modification
        const updatedRates = { ...data.rates };
        
        // Add the base currency to rates with value 1
        updatedRates[currency] = 1;
        
        // Add Tunisian Dinar if it's not in the API response
        if (!updatedRates.TND) {
          if (currency === "TND") {
            updatedRates.USD = 0.32; // Approximate: 1 TND ≈ 0.32 USD
            updatedRates.EUR = 0.29; // Approximate: 1 TND ≈ 0.29 EUR
          } else if (currency === "USD") {
            updatedRates.TND = 3.13; // Approximate: 1 USD ≈ 3.13 TND
          } else if (currency === "EUR") {
            updatedRates.TND = 3.47; // Approximate: 1 EUR ≈ 3.47 TND
          } else {
            // For other base currencies, calculate an approximate TND rate
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
          setBaseCurrency("USD");
        } else if (currency === "EUR") {
          fallbackRates.USD = 1.09;
          fallbackRates.TND = 3.47;
          setBaseCurrency("EUR");
        } else if (currency === "TND") {
          fallbackRates.USD = 0.32;
          fallbackRates.EUR = 0.29;
          setBaseCurrency("TND");
        }
        
        setRates(fallbackRates);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [currency]);

  // Convert price from source currency to the selected currency
  const convertPrice = (amount: number | string, fromCurrency = "USD"): number => {
    if (!amount) return 0;
    
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) return 0;
    
    // If the source and target currencies are the same, no conversion needed
    if (fromCurrency === currency) return numericAmount;
    
    // The proper conversion logic when currencies are different:
    try {
      // Case 1: Direct conversion using API rates
      // Since our rates are based on the user's selected currency,
      // we can directly use the rate for the fromCurrency
      if (rates[fromCurrency]) {
        // When converting FROM the selected currency TO another currency,
        // we multiply by the rate (1 selected = X target)
        if (baseCurrency === currency) {
          return numericAmount * rates[fromCurrency];
        }
        
        // When converting FROM another currency TO the selected currency,
        // we divide by the rate (X currency = 1 selected)
        return numericAmount / rates[fromCurrency];
      }
      
      // If we don't have a direct rate, try to convert through USD as intermediate
      if (rates.USD && fromCurrency !== "USD") {
        // First convert to USD, then to the target currency
        const amountInUsd = fromCurrency === baseCurrency 
          ? numericAmount * rates.USD  // From base to USD
          : numericAmount / rates[fromCurrency]; // From other to USD
          
        return amountInUsd * (currency === baseCurrency 
          ? rates[currency] // USD to base
          : 1 / rates.USD); // USD to selected
      }
      
      // Fallback
      console.warn(`Cannot convert between ${fromCurrency} and ${currency} - missing rates`);
      return numericAmount;
    } catch (error) {
      console.error("Error converting currency:", error);
      return numericAmount;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, rates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}; 
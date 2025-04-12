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
        setRates(data.rates);
        
        // Add the base currency to rates with value 1
        setRates(prev => ({
          ...prev,
          [currency]: 1
        }));
      } catch (error) {
        console.error("Error fetching currency rates:", error);
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
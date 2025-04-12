"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available currencies with TND first as default
export const currencies = [
  { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

// Define exchange rates relative to TND
const exchangeRates = {
  TND: 1,
  USD: 0.32, // 1 TND = 0.32 USD
  EUR: 0.30, // 1 TND = 0.30 EUR
  GBP: 0.25, // 1 TND = 0.25 GBP
};

type CurrencyContextType = {
  currency: { code: string; symbol: string; name: string };
  setCurrency: (currency: { code: string; symbol: string; name: string }) => void;
  convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  formatPrice: (amount: number, currencyCode?: string) => string;
  currencies: typeof currencies;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to TND
  const [currency, setCurrency] = useState(currencies[0]);

  // Load saved currency from localStorage on client side
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      const parsedCurrency = JSON.parse(savedCurrency);
      const foundCurrency = currencies.find(c => c.code === parsedCurrency.code);
      if (foundCurrency) setCurrency(foundCurrency);
    }
  }, []);

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredCurrency', JSON.stringify(currency));
  }, [currency]);

  // Convert price from one currency to another
  const convertPrice = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    if (!amount) return 0;
    const targetCurrency = toCurrency || currency.code;
    
    // Convert to TND first (as base currency)
    const amountInTND = amount / exchangeRates[fromCurrency as keyof typeof exchangeRates];
    
    // Then convert from TND to target currency
    const convertedAmount = amountInTND * exchangeRates[targetCurrency as keyof typeof exchangeRates];
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  };

  // Format price with currency symbol
  const formatPrice = (amount: number, currencyCode?: string): string => {
    const code = currencyCode || currency.code;
    const symbol = currencies.find(c => c.code === code)?.symbol || '';
    
    // For TND, the symbol typically comes after the amount
    if (code === 'TND') {
      return `${amount.toFixed(2)} ${symbol}`;
    }
    
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

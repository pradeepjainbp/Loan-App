/**
 * Currency utilities for formatting and symbol mapping
 */

import { Currency } from '../types';

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

export const currencyNames: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  INR: 'Indian Rupee',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
};

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: Currency): string {
  return currencySymbols[currency] || '$';
}

/**
 * Get currency name for a given currency code
 */
export function getCurrencyName(currency: Currency): string {
  return currencyNames[currency] || 'Currency';
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format amount with currency symbol and locale
 */
export function formatCurrencyLocale(amount: number, currency: Currency, locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback to simple formatting
    return formatCurrency(amount, currency);
  }
}


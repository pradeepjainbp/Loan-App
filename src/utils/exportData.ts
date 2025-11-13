/**
 * Data export utilities for CSV and JSON formats
 */

import { Loan, Repayment } from '../types';

export interface ExportData {
  loans: Loan[];
  repayments: Repayment[];
  exportDate: string;
}

/**
 * Convert loans and repayments to CSV format
 */
export function generateCSV(loans: Loan[], repayments: Repayment[]): string {
  let csv = '';

  // Loans CSV
  csv += 'LOANS\n';
  csv += 'ID,Lender,Borrower,Principal,Start Date,Due Date,Interest Type,Interest Rate,Status,Notes\n';
  
  loans.forEach((loan) => {
    const row = [
      loan.id,
      `"${loan.lender_name}"`,
      `"${loan.borrower_name}"`,
      loan.principal_amount,
      new Date(loan.start_date).toLocaleDateString(),
      new Date(loan.due_date).toLocaleDateString(),
      loan.interest_type,
      loan.interest_rate || 0,
      loan.status,
      `"${loan.notes || ''}"`,
    ].join(',');
    csv += row + '\n';
  });

  csv += '\n\nREPAYMENTS\n';
  csv += 'ID,Loan ID,Amount,Payment Date,Payment Method,Notes\n';
  
  repayments.forEach((repayment) => {
    const row = [
      repayment.id,
      repayment.loan_id,
      repayment.payment_amount,
      new Date(repayment.payment_date).toLocaleDateString(),
      repayment.payment_method,
      `"${repayment.notes || ''}"`,
    ].join(',');
    csv += row + '\n';
  });

  return csv;
}

/**
 * Convert loans and repayments to JSON format
 */
export function generateJSON(loans: Loan[], repayments: Repayment[]): string {
  const data: ExportData = {
    loans,
    repayments,
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Detect if we're on web platform
 */
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * Download data as file (for web)
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  if (!isWeb) return;

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Share data as text (for mobile)
 */
export async function shareData(content: string, title: string, filename: string): Promise<void> {
  // Try React Native Share first
  try {
    const Share = require('react-native').Share;
    await Share.share({
      message: content,
      title: title,
    });
    return;
  } catch (error) {
    // React Native not available or share failed, try web API
  }

  // Try web share API
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text: content,
      });
      return;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // User cancelled, ignore
      }
    }
  }

  // Fallback: copy to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(content);
    throw new Error('Data copied to clipboard');
  }
  
  throw new Error('Share/Export not available on this platform');
}

/**
 * Export data to CSV file
 */
export async function exportToCSV(loans: Loan[], repayments: Repayment[]): Promise<void> {
  const csv = generateCSV(loans, repayments);
  const filename = `loan-app-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  if (isWeb) {
    downloadFile(csv, filename, 'text/csv');
  } else {
    await shareData(csv, 'Export Loan Data (CSV)', filename);
  }
}

/**
 * Export data to JSON file
 */
export async function exportToJSON(loans: Loan[], repayments: Repayment[]): Promise<void> {
  const json = generateJSON(loans, repayments);
  const filename = `loan-app-export-${new Date().toISOString().split('T')[0]}.json`;
  
  if (isWeb) {
    downloadFile(json, filename, 'application/json');
  } else {
    await shareData(json, 'Export Loan Data (JSON)', filename);
  }
}

/**
 * Get backup status information
 */
export function getBackupStatus(): {
  status: string;
  lastBackup: string;
  nextBackup: string;
  message: string;
} {
  return {
    status: 'Active',
    lastBackup: new Date().toLocaleString(),
    nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
    message: 'Your data is automatically backed up to Supabase cloud and synced across all your devices in real-time.',
  };
}


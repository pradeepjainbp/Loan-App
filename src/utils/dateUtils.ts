import { format, parseISO, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { DateFormat } from '../types';

/**
 * Format date according to user preference
 */
export function formatDate(date: string | Date, dateFormat: DateFormat = 'MM/DD/YYYY'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return format(dateObj, 'dd/MM/yyyy');
    case 'MM/DD/YYYY':
      return format(dateObj, 'MM/dd/yyyy');
    case 'YYYY-MM-DD':
      return format(dateObj, 'yyyy-MM-dd');
    default:
      return format(dateObj, 'MM/dd/yyyy');
  }
}

/**
 * Get days until due date
 */
export function getDaysUntilDue(dueDate: string | null): number {
  if (!dueDate) return Infinity; // No due date means never due
  return differenceInDays(parseISO(dueDate), new Date());
}

/**
 * Check if loan is due within specified days
 */
export function isDueWithinDays(dueDate: string | null, days: number): boolean {
  if (!dueDate) return false; // No due date means not due soon
  const daysUntil = getDaysUntilDue(dueDate);
  return daysUntil >= 0 && daysUntil <= days;
}

/**
 * Check if loan is overdue
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false; // No due date means not overdue
  return getDaysUntilDue(dueDate) < 0;
}

/**
 * Get ISO date string from Date object
 */
export function toISODate(date: Date): string {
  return date.toISOString();
}

/**
 * Get current date as ISO string
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}


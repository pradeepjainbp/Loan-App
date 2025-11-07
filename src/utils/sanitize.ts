/**
 * Input Sanitization Utilities
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * Sanitize plain text input (names, notes, etc.)
 * Removes HTML tags and dangerous characters
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize numeric input
 * Ensures only valid numbers are accepted
 */
export function sanitizeNumber(input: string | number | undefined | null): number {
  if (input === undefined || input === null || input === '') return 0;
  
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) return 0;
  
  return num;
}

/**
 * Sanitize currency amount
 * Limits to 2 decimal places and ensures positive
 */
export function sanitizeCurrency(input: string | number | undefined | null): number {
  const num = sanitizeNumber(input);
  return Math.max(0, Math.round(num * 100) / 100);
}

/**
 * Sanitize percentage
 * Ensures value is between 0 and 100
 */
export function sanitizePercentage(input: string | number | undefined | null): number {
  const num = sanitizeNumber(input);
  return Math.max(0, Math.min(100, num));
}

/**
 * Sanitize date string
 * Ensures valid ISO date format
 */
export function sanitizeDate(input: string | undefined | null): string {
  if (!input) return new Date().toISOString();
  
  try {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Sanitize email
 * Basic email validation and sanitization
 */
export function sanitizeEmail(input: string | undefined | null): string {
  if (!input) return '';
  
  const sanitized = input.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except + and -
 */
export function sanitizePhone(input: string | undefined | null): string {
  if (!input) return '';
  
  return input.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Sanitize array of strings (tags, etc.)
 * Removes empty strings and duplicates
 */
export function sanitizeStringArray(input: string[] | undefined | null): string[] {
  if (!input || !Array.isArray(input)) return [];
  
  return [...new Set(
    input
      .map(item => sanitizeText(item))
      .filter(item => item.length > 0)
  )];
}

/**
 * Validate and sanitize loan data
 */
export function sanitizeLoanData(data: any): any {
  return {
    lender_name: sanitizeText(data.lender_name),
    borrower_name: sanitizeText(data.borrower_name),
    principal_amount: sanitizeCurrency(data.principal_amount),
    start_date: sanitizeDate(data.start_date),
    due_date: sanitizeDate(data.due_date),
    interest_type: data.interest_type, // Enum, validated elsewhere
    interest_rate: sanitizePercentage(data.interest_rate),
    compounding_frequency: data.compounding_frequency, // Enum
    notes: sanitizeText(data.notes),
    tags: sanitizeStringArray(data.tags),
    status: data.status, // Enum
    is_user_lender: Boolean(data.is_user_lender),
  };
}

/**
 * Validate and sanitize repayment data
 */
export function sanitizeRepaymentData(data: any): any {
  return {
    loan_id: sanitizeText(data.loan_id),
    payment_amount: sanitizeCurrency(data.payment_amount),
    payment_date: sanitizeDate(data.payment_date),
    payment_method: data.payment_method, // Enum
    transaction_reference: sanitizeText(data.transaction_reference),
    notes: sanitizeText(data.notes),
  };
}

/**
 * Prevent SQL injection in search queries
 */
export function sanitizeSearchQuery(query: string | undefined | null): string {
  if (!query) return '';
  
  return query
    .replace(/[';\"\\]/g, '') // Remove SQL special characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .trim()
    .substring(0, 100); // Limit length
}


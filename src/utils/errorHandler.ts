/**
 * Error handling and retry logic utilities
 */

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = delayMs * Math.pow(backoffMultiplier, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error?.message?.includes('Network') || error?.message?.includes('network')) {
    return true;
  }

  // Timeout errors
  if (error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
    return true;
  }

  // Server errors (5xx)
  if (error?.status >= 500 && error?.status < 600) {
    return true;
  }

  // Rate limiting (429)
  if (error?.status === 429) {
    return true;
  }

  // Connection refused
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
    return true;
  }

  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  // Network errors
  if (error?.message?.includes('Network') || error?.message?.includes('network')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Authentication errors
  if (error?.status === 401 || error?.message?.includes('Unauthorized')) {
    return 'Your session has expired. Please sign in again.';
  }

  // Permission errors
  if (error?.status === 403 || error?.message?.includes('Forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  // Not found errors
  if (error?.status === 404 || error?.message?.includes('not found')) {
    return 'The requested item was not found.';
  }

  // Validation errors
  if (error?.status === 400 || error?.message?.includes('Validation')) {
    return error?.message || 'Invalid input. Please check your data and try again.';
  }

  // Server errors
  if (error?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  // Default error message
  return error?.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Check if user is offline
 */
export function isOffline(): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine !== undefined) {
    return !navigator.onLine;
  }
  return false;
}

/**
 * Wrap an async function with error handling and retry logic
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await retryWithBackoff(fn, options);
    return { data, error: null };
  } catch (error) {
    const errorMessage = getUserFriendlyErrorMessage(error);
    console.error('Error:', errorMessage, error);
    return { data: null, error: errorMessage };
  }
}


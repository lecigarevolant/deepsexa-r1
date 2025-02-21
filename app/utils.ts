/**
 * Utility functions for the application
 */

/**
 * Gets the asset path with the correct base URL prefix
 */
export const getAssetPath = (path: string): string => {
  return `/deepsexa${path}`;
};

/**
 * Parses LLM message content to extract thinking process and final response
 */
export const parseMessageContent = (content: string) => {
  // If we find a complete think tag
  if (content.includes('</think>')) {
    const [thinking, ...rest] = content.split('</think>');
    return {
      thinking: thinking.replace('<think>', '').trim(),
      finalResponse: rest.join('</think>').trim(),
      isComplete: true
    };
  }
  // If we only find opening think tag, everything after it is thinking
  if (content.includes('<think>')) {
    return {
      thinking: content.replace('<think>', '').trim(),
      finalResponse: '',
      isComplete: false
    };
  }
  // No think tags, everything is final response
  return {
    thinking: '',
    finalResponse: content,
    isComplete: true
  };
};

/**
 * Retry configuration type
 */
interface RetryConfig {
  maxRetries?: number;
  backoffMs?: number;
  maxBackoffMs?: number;
}

/**
 * Retries a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  { maxRetries = 3, backoffMs = 1000, maxBackoffMs = 10000 }: RetryConfig = {}
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Calculate backoff with jitter
      const jitter = Math.random() * 0.1 * backoffMs;
      const delay = Math.min(backoffMs * Math.pow(2, attempt) + jitter, maxBackoffMs);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Retries a fetch request with exponential backoff
 */
export async function retryFetch(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> {
  return retry(
    async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    },
    retryConfig
  );
} 
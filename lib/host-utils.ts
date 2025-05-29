/**
 * Utility functions for determining the current host/domain
 */

/**
 * Returns the current host, with port if in development environment
 */
export async function getCurrentHost(): Promise<string> {
  // In development, default to localhost:3000
  if (process.env.NODE_ENV === 'development') {
    return 'localhost:3000';
  }
  
  // In production, use the deployed domain
  return process.env.NEXT_PUBLIC_DOMAIN || 'example.com'; 
}

/**
 * Returns the base URL for the application
 */
export function getBaseUrl(): string {
  const host = getCurrentHost();
  
  if (process.env.NODE_ENV === 'development') {
    return `http://${host}`;
  }
  
  return `https://${host}`;
}
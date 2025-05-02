// Environment variables configuration for Next.js
// Values should be set in .env.local file 

// Calculate 3 months in milliseconds: 3 months * 30 days * 24 hours * 60 minutes * 60 seconds * 1000 ms
const THREE_MONTHS_MS = 3 * 30 * 24 * 60 * 60 * 1000;

// Use environment variables - client-side accessible variables must use NEXT_PUBLIC_ prefix
export const env = {
  // Admin credentials - these are sensitive so we don't provide defaults
  ADMIN_USERNAME: process.env.NEXT_PUBLIC_ADMIN_USERNAME || '',
  ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',
  SECRET_KEY: process.env.NEXT_PUBLIC_SECRET_KEY || '',
  
  // Token expiration (3 months in milliseconds)
  TOKEN_EXPIRY: parseInt(process.env.NEXT_PUBLIC_TOKEN_EXPIRY || THREE_MONTHS_MS.toString()), 
}; 
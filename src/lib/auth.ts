// Simple token-based authentication utilities
import Cookies from 'js-cookie';
import { env } from './env';

// Token expiration time
const TOKEN_EXPIRY = env.TOKEN_EXPIRY; // from env file

// Validate credentials
export function validateCredentials(username: string, password: string) {
  return username === env.ADMIN_USERNAME && 
         password === env.ADMIN_PASSWORD;
}

// Generate a simple token (in a real app, would use JWT)
export function generateToken() {
  const payload = {
    exp: Date.now() + TOKEN_EXPIRY,
    username: env.ADMIN_USERNAME
  };
  
  return btoa(JSON.stringify(payload));
}

// Validate token
export function validateToken(token: string) {
  try {
    if (!token) return false;
    
    const payload = JSON.parse(atob(token));
    
    // Check if token is expired
    if (payload.exp < Date.now()) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Store token in both localStorage and cookie (client-side only)
export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    // Set in localStorage
    localStorage.setItem('auth_token', token);
    
    // Set in cookie
    Cookies.set('auth_token', token, { 
      expires: 90, // 3 months
      path: '/',
      sameSite: 'strict'
    });
  }
}

// Get token from localStorage or cookie (client-side only)
export function getToken() {
  if (typeof window !== 'undefined') {
    // Try localStorage first
    const localToken = localStorage.getItem('auth_token');
    if (localToken) return localToken;
    
    // Then try cookie
    return Cookies.get('auth_token');
  }
  return null;
}

// Remove token from both localStorage and cookie (client-side only)
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    Cookies.remove('auth_token', { path: '/' });
  }
} 
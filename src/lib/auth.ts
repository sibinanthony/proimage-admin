// Simple token-based authentication utilities
import Cookies from 'js-cookie';

// Hardcoded admin credentials - in a real app, these would be in a secure database
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'proimage123'
};

// Secret key for token generation - would use env variable in production
const SECRET_KEY = 'proimage-admin-secret-key';

// Token expiration time (24 hours)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Validate credentials
export function validateCredentials(username: string, password: string) {
  return username === ADMIN_CREDENTIALS.username && 
         password === ADMIN_CREDENTIALS.password;
}

// Generate a simple token (in a real app, would use JWT)
export function generateToken() {
  const payload = {
    exp: Date.now() + TOKEN_EXPIRY,
    username: ADMIN_CREDENTIALS.username
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
    
    // Check if token has the expected username
    if (payload.username !== ADMIN_CREDENTIALS.username) {
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
      expires: 1, // 1 day
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
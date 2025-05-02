import { NextResponse } from 'next/server';

// 3 months in milliseconds
const TOKEN_EXPIRY = 3 * 30 * 24 * 60 * 60 * 1000;

// Generate a simple token
function generateToken(username: string) {
  const payload = {
    exp: Date.now() + TOKEN_EXPIRY,
    username: username
  };
  
  return btoa(JSON.stringify(payload));
}

export async function POST(request: Request) {
  try {
    // Get credentials from request body
    const body = await request.json();
    const { username, password } = body;
    
    // Get credentials from environment variables
    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;
    
    // Validate if environment variables are set
    if (!envUsername || !envPassword) {
      console.error('Admin credentials not configured in environment variables');
      return NextResponse.json(
        { error: 'Authentication service misconfigured' },
        { status: 500 }
      );
    }
    
    // Validate credentials
    if (username === envUsername && password === envPassword) {
      // Generate and return token
      const token = generateToken(username);
      
      // Return success with token
      return NextResponse.json({ 
        success: true, 
        token,
        expiresIn: TOKEN_EXPIRY
      });
    }
    
    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 
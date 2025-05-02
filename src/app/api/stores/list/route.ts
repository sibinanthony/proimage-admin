import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get a list of stores with minimal data for dropdown selection
    const stores = await prisma.stores.findMany({
      select: {
        id: true,
        name: true,
        domain: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching store list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store list' },
      { status: 500 }
    );
  }
} 
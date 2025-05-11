import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }
    
    // Get store information
    const store = await prisma.stores.findUnique({
      where: { id },
      select: {
        id: true,
        name: true
      }
    });
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    // Get generated images for the store with their product information
    const generatedImages = await prisma.generated_images.findMany({
      where: {
        jobs: {
          storeId: id
        }
      },
      include: {
        products: {
          select: {
            title: true,
            handle: true,
            originalImageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      storeName: store.name,
      images: generatedImages
    });
    
  } catch (error) {
    console.error('Error fetching store images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store images' },
      { status: 500 }
    );
  }
} 
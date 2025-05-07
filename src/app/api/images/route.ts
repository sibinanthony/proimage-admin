import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const storeId = searchParams.get('storeId') || undefined;
    
    // Calculate pagination values
    const skip = (page - 1) * pageSize;
    
    // Build the where clause based on filters
    const where: any = {};
    if (storeId) {
      where.jobs = { storeId };
    }
    
    // Get total count for pagination
    const totalImages = await prisma.generated_images.count({
      where
    });
    
    // Get images with pagination
    const images = await prisma.generated_images.findMany({
      where,
      include: {
        products: {
          select: {
            title: true,
            handle: true
          }
        },
        jobs: {
          select: {
            storeId: true,
            stores: {
              select: {
                name: true,
                domain: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: pageSize
    });
    
    return NextResponse.json({
      images,
      pagination: {
        total: totalImages,
        page,
        pageSize,
        pageCount: Math.ceil(totalImages / pageSize)
      }
    });
    
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '10');
    const page = Number(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build the search condition with proper typing
    const where: Prisma.storesWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { domain: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }
      : {};
    
    // Get stores with pagination
    const stores = await prisma.stores.findMany({
      where,
      include: {
        products: {
          select: {
            id: true,
          },
        },
        jobs: {
          select: {
            id: true,
          },
        },
        store_credits: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
    });
    
    // Transform the data to match our UI needs
    const formattedStores = stores.map((store) => ({
      id: store.id,
      shopifyId: store.shopifyId,
      name: store.name,
      domain: store.domain,
      creditsRemaining: store.store_credits?.creditsRemaining || 0,
      totalProducts: store.products.length,
      totalJobs: store.jobs.length,
      createdAt: store.createdAt,
    }));
    
    // Get total count for pagination
    const totalCount = await prisma.stores.count({ where });
    
    return NextResponse.json({
      stores: formattedStores,
      pagination: {
        total: totalCount,
        page,
        pageSize: limit,
        pageCount: Math.ceil(totalCount / limit),
      },
    });
    
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
} 
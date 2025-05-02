import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '10');
    const page = Number(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const filterActive = searchParams.get('active');
    const creditFilter = searchParams.get('credits');
    
    const skip = (page - 1) * limit;
    
    // Build the search and filter conditions with proper typing
    const where: Prisma.storesWhereInput = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { domain: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      ];
    }
    
    // Active/inactive filter - based on activity within the last 30 days
    if (filterActive) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (filterActive === 'active') {
        where.OR = [
          ...(where.OR || []),
          {
            jobs: {
              some: {
                createdAt: { gte: thirtyDaysAgo }
              }
            }
          },
          {
            credit_transactions: {
              some: {
                createdAt: { gte: thirtyDaysAgo }
              }
            }
          }
        ];
      } else if (filterActive === 'inactive') {
        where.AND = [
          {
            jobs: {
              none: {
                createdAt: { gte: thirtyDaysAgo }
              }
            }
          },
          {
            credit_transactions: {
              none: {
                createdAt: { gte: thirtyDaysAgo }
              }
            }
          }
        ];
      }
    }
    
    // Credits filter
    if (creditFilter) {
      if (creditFilter === 'low') {
        where.store_credits = {
          creditsRemaining: { lt: 10 }
        };
      } else if (creditFilter === 'zero') {
        where.store_credits = {
          creditsRemaining: { equals: 0 }
        };
      } else if (creditFilter === 'high') {
        where.store_credits = {
          creditsRemaining: { gte: 50 }
        };
      }
    }
    
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
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
        },
        store_credits: true,
        credit_transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
    });
    
    // Get the latest activity date for each store
    const formattedStores = stores.map((store) => {
      // Find the latest activity (job or transaction)
      const lastJobDate = store.jobs[0]?.createdAt;
      const lastTransactionDate = store.credit_transactions[0]?.createdAt;
      
      // Compare dates to find the most recent activity
      let lastActiveDate = store.createdAt; // Default to creation date
      
      if (lastJobDate && lastTransactionDate) {
        lastActiveDate = lastJobDate > lastTransactionDate ? lastJobDate : lastTransactionDate;
      } else if (lastJobDate) {
        lastActiveDate = lastJobDate;
      } else if (lastTransactionDate) {
        lastActiveDate = lastTransactionDate;
      }
      
      // Consider a store active if it has had activity in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isActive = lastActiveDate >= thirtyDaysAgo;
      
      return {
        id: store.id,
        shopifyId: store.shopifyId,
        name: store.name,
        domain: store.domain,
        creditsRemaining: store.store_credits?.creditsRemaining || 0,
        totalProducts: store.products.length,
        totalJobs: store.jobs.length,
        lastJob: store.jobs[0]?.createdAt || null,
        lastTransaction: store.credit_transactions[0]?.createdAt || null,
        lastActiveDate,
        isActive,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      };
    });
    
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
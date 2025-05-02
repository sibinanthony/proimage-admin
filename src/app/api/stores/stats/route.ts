import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get total store count
    const totalStores = await prisma.stores.count();
    
    // Get active stores (active in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Count stores with recent jobs
    const storesWithRecentJobs = await prisma.stores.count({
      where: {
        jobs: {
          some: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      }
    });
    
    // Count stores with recent transactions
    const storesWithRecentTransactions = await prisma.stores.count({
      where: {
        credit_transactions: {
          some: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      }
    });
    
    // Combine the two for active stores (either jobs or transactions)
    // This requires a raw query to avoid double-counting
    const activeStoresQuery = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(DISTINCT s.id) 
      FROM "stores" s
      LEFT JOIN "jobs" j ON s.id = j."storeId" AND j."createdAt" >= ${thirtyDaysAgo}
      LEFT JOIN "credit_transactions" ct ON s.id = ct."storeId" AND ct."createdAt" >= ${thirtyDaysAgo}
      WHERE j.id IS NOT NULL OR ct.id IS NOT NULL
    `;
    const activeStores = Number(activeStoresQuery[0]?.count || 0);
    
    // Calculate inactive stores
    const inactiveStores = totalStores - activeStores;
    
    // Get stores with zero credits
    const storesWithZeroCredits = await prisma.stores.count({
      where: {
        store_credits: {
          creditsRemaining: 0
        }
      }
    });
    
    // Get stores with low credits (less than 10)
    const storesWithLowCredits = await prisma.stores.count({
      where: {
        store_credits: {
          creditsRemaining: {
            gt: 0,
            lt: 10
          }
        }
      }
    });
    
    // Get stores created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newStoresToday = await prisma.stores.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });
    
    // Get stores created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newStoresLastWeek = await prisma.stores.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });
    
    // Get stores created in the last 30 days
    const newStoresLastMonth = await prisma.stores.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    return NextResponse.json({
      total: totalStores,
      active: activeStores,
      inactive: inactiveStores,
      withRecentJobs: storesWithRecentJobs,
      withRecentTransactions: storesWithRecentTransactions,
      zeroCredits: storesWithZeroCredits,
      lowCredits: storesWithLowCredits,
      newToday: newStoresToday,
      newLastWeek: newStoresLastWeek,
      newLastMonth: newStoresLastMonth
    });
    
  } catch (error) {
    console.error('Error fetching store statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store statistics' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreditTransactionType, JobStatus } from '@prisma/client';

export async function GET() {
  try {
    // Current period data
    // Get total store count
    const totalStores = await prisma.stores.count();
    
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

    // Get stores created yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const newStoresYesterday = await prisma.stores.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today
        }
      }
    });

    // Get stores count from a week ago
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const storesOneWeekAgo = await prisma.stores.count({
      where: {
        createdAt: {
          lte: oneWeekAgo
        }
      }
    });
    
    // Current month for revenue and credits
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Previous month for comparison
    const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Current month revenue (purchase transactions)
    const currentMonthRevenue = await prisma.credit_transactions.aggregate({
      where: {
        type: CreditTransactionType.PURCHASE,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Previous month revenue
    const prevMonthRevenue = await prisma.credit_transactions.aggregate({
      where: {
        type: CreditTransactionType.PURCHASE,
        createdAt: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Current month credits used
    const currentMonthCreditsUsed = await prisma.credit_transactions.aggregate({
      where: {
        type: CreditTransactionType.USAGE,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Previous month credits used
    const prevMonthCreditsUsed = await prisma.credit_transactions.aggregate({
      where: {
        type: CreditTransactionType.USAGE,
        createdAt: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Get total jobs and completed jobs
    const totalJobs = await prisma.jobs.count();
    const completedJobs = await prisma.jobs.count({
      where: {
        status: JobStatus.COMPLETED
      }
    });
    
    return NextResponse.json({
      // Current data
      totalStores,
      newStoresToday,
      totalRevenue: currentMonthRevenue._sum.amount || 0,
      creditsUsed: Math.abs(currentMonthCreditsUsed._sum.amount || 0),
      totalJobs,
      completedJobs,
      
      // Comparison data
      storesOneWeekAgo,
      newStoresYesterday,
      prevMonthRevenue: prevMonthRevenue._sum.amount || 0,
      prevMonthCreditsUsed: Math.abs(prevMonthCreditsUsed._sum.amount || 0),
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 
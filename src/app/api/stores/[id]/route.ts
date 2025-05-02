import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreditTransactionType } from '@prisma/client';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }
    
    // Get store details with related data
    const store = await prisma.stores.findUnique({
      where: { id },
      include: {
        products: true,
        jobs: {
          include: {
            generated_images: true
          }
        },
        store_credits: true,
        credit_transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    // Get count of jobs by status
    const jobStatusCounts = await prisma.jobs.groupBy({
      by: ['status'],
      where: {
        storeId: id
      },
      _count: {
        id: true
      }
    });
    
    // Calculate credit statistics
    const purchaseTransactions = store.credit_transactions.filter(
      tx => tx.type === CreditTransactionType.PURCHASE
    );
    
    const usageTransactions = store.credit_transactions.filter(
      tx => tx.type === CreditTransactionType.USAGE
    );
    
    const totalPurchased = purchaseTransactions.reduce(
      (sum, tx) => sum + tx.amount, 
      0
    );
    
    const totalUsed = usageTransactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount), 
      0
    );
    
    // Get credits by month for the last 6 months - using a simpler approach
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Generate an array of the last 6 months in YYYY-MM format
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }).reverse();
    
    // Initialize with zero values
    const monthlyCredits = last6Months.map(month => ({
      month,
      purchased: 0,
      used: 0
    }));
    
    // Get all transactions for the store in the last 6 months
    const transactions = await prisma.credit_transactions.findMany({
      where: {
        storeId: id,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        amount: true,
        type: true,
        createdAt: true
      }
    });
    
    // Process transactions and aggregate by month
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      
      // Find the matching month in our prepared array
      const monthlyData = monthlyCredits.find(m => m.month === monthKey);
      if (monthlyData) {
        if (tx.type === CreditTransactionType.PURCHASE || 
            tx.type === CreditTransactionType.PROMOTIONAL || 
            tx.type === CreditTransactionType.INITIAL_FREE) {
          monthlyData.purchased += tx.amount;
        } else if (tx.type === CreditTransactionType.USAGE) {
          monthlyData.used += Math.abs(tx.amount);
        }
      }
    });
    
    // Get recent transactions
    const recentTransactions = store.credit_transactions.slice(0, 10).map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.type === CreditTransactionType.USAGE ? -Math.abs(tx.amount) : tx.amount,
      description: tx.description,
      date: tx.createdAt
    }));
    
    // Calculate active status
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const hasRecentJobs = store.jobs.some(job => 
      new Date(job.createdAt) >= thirtyDaysAgo
    );
    
    const hasRecentTransactions = store.credit_transactions.some(tx => 
      new Date(tx.createdAt) >= thirtyDaysAgo
    );
    
    const isActive = hasRecentJobs || hasRecentTransactions;
    
    // Last active date
    const lastJobDate = store.jobs.length > 0 
      ? new Date(Math.max(...store.jobs.map(job => new Date(job.createdAt).getTime())))
      : null;
    
    const lastTransactionDate = store.credit_transactions.length > 0
      ? new Date(Math.max(...store.credit_transactions.map(tx => new Date(tx.createdAt).getTime())))
      : null;
    
    let lastActiveDate = store.createdAt;
    
    if (lastJobDate && lastTransactionDate) {
      lastActiveDate = lastJobDate > lastTransactionDate ? lastJobDate : lastTransactionDate;
    } else if (lastJobDate) {
      lastActiveDate = lastJobDate;
    } else if (lastTransactionDate) {
      lastActiveDate = lastTransactionDate;
    }
    
    return NextResponse.json({
      id: store.id,
      shopifyId: store.shopifyId,
      name: store.name,
      domain: store.domain,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      isActive,
      lastActiveDate,
      
      // Credit info
      credits: {
        remaining: store.store_credits?.creditsRemaining || 0,
        totalPurchased,
        totalUsed,
        utilizationRate: totalPurchased > 0 ? (totalUsed / totalPurchased) * 100 : 0
      },
      
      // Stats
      stats: {
        totalProducts: store.products.length,
        totalJobs: store.jobs.length,
        totalImages: store.jobs.reduce((sum, job) => sum + job.generated_images.length, 0),
        jobStatusCounts: jobStatusCounts.reduce((acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        }, {} as Record<string, number>)
      },
      
      // Charts data
      charts: {
        monthlyCredits
      },
      
      // Recent transactions
      recentTransactions
    });
    
  } catch (error) {
    console.error('Error fetching store details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store details' },
      { status: 500 }
    );
  }
} 
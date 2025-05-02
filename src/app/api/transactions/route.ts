import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreditTransactionType, Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '20');
    const page = Number(searchParams.get('page') || '1');
    const typeParam = searchParams.get('type');
    const storeId = searchParams.get('storeId');
    const period = searchParams.get('period');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    const skip = (page - 1) * limit;
    
    // Build the query conditions
    const where: Prisma.credit_transactionsWhereInput = {};
    
    // Filter by transaction type (skip if 'all' or null)
    if (typeParam && typeParam !== 'all') {
      where.type = typeParam as CreditTransactionType;
    }
    
    // Filter by store (skip if 'all' or null)
    if (storeId && storeId !== 'all') {
      where.storeId = storeId;
    }
    
    // Date filters
    if (period || startDateParam || endDateParam) {
      where.createdAt = {};
      
      if (period) {
        const now = new Date();
        
        switch(period) {
          case 'today': {
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            where.createdAt = { ...where.createdAt, gte: today };
            break;
          }
          case 'thisWeek': {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            startOfWeek.setHours(0, 0, 0, 0);
            where.createdAt = { ...where.createdAt, gte: startOfWeek };
            break;
          }
          case 'thisMonth': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            where.createdAt = { ...where.createdAt, gte: startOfMonth };
            break;
          }
          case 'lastMonth': {
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            where.createdAt = { 
              ...where.createdAt, 
              gte: startOfLastMonth,
              lte: endOfLastMonth 
            };
            break;
          }
          case 'last3Months': {
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            where.createdAt = { ...where.createdAt, gte: threeMonthsAgo };
            break;
          }
          case 'last6Months': {
            const sixMonthsAgo = new Date(now);
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            where.createdAt = { ...where.createdAt, gte: sixMonthsAgo };
            break;
          }
          case 'thisYear': {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            where.createdAt = { ...where.createdAt, gte: startOfYear };
            break;
          }
          // Default is all time (no filter)
          case 'allTime':
          default:
            delete where.createdAt;
            break;
        }
      } else {
        // Custom date range
        if (startDateParam) {
          where.createdAt = { ...where.createdAt, gte: new Date(startDateParam) };
        }
        
        if (endDateParam) {
          const endDate = new Date(endDateParam);
          // Set to end of day
          endDate.setHours(23, 59, 59, 999);
          where.createdAt = { ...where.createdAt, lte: endDate };
        }
      }
    }

    // Get transactions with pagination
    const transactions = await prisma.credit_transactions.findMany({
      where,
      include: {
        stores: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip
    });
    
    // Transform the data to match our UI needs
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      storeId: transaction.storeId,
      storeName: transaction.stores.name,
      storeDomain: transaction.stores.domain,
      type: transaction.type,
      amount: transaction.type === CreditTransactionType.USAGE ? -Math.abs(transaction.amount) : transaction.amount,
      description: transaction.description,
      shopifyChargeId: transaction.shopifyChargeId,
      date: transaction.createdAt
    }));
    
    // Get total count for pagination
    const totalCount = await prisma.credit_transactions.count({ where });
    
    // Get summary statistics
    const summary = await getTransactionSummary(where);
    
    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        total: totalCount,
        page,
        pageSize: limit,
        pageCount: Math.ceil(totalCount / limit)
      },
      summary
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// Helper function to get transaction summary statistics
async function getTransactionSummary(where: Prisma.credit_transactionsWhereInput) {
  // Get total by transaction type
  const typeSummary = await prisma.credit_transactions.groupBy({
    by: ['type'],
    where,
    _sum: {
      amount: true
    },
    _count: true
  });
  
  // Process the summary
  const summary = {
    totalTransactions: 0,
    totalPurchased: 0,
    totalUsed: 0,
    transactions: {} as Record<string, { count: number, amount: number }>
  };
  
  typeSummary.forEach(item => {
    summary.totalTransactions += item._count;
    
    if (item.type === CreditTransactionType.USAGE) {
      summary.totalUsed = Math.abs(item._sum.amount || 0);
    } else if (
      item.type === CreditTransactionType.PURCHASE ||
      item.type === CreditTransactionType.PROMOTIONAL ||
      item.type === CreditTransactionType.INITIAL_FREE
    ) {
      summary.totalPurchased += (item._sum.amount || 0);
    }
    
    summary.transactions[item.type] = {
      count: item._count,
      amount: Math.abs(item._sum.amount || 0)
    };
  });
  
  return summary;
} 
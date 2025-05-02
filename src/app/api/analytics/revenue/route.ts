import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreditTransactionType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // month, quarter, year
    
    // Calculate start date based on period
    const today = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(today.getMonth() - 1); // Default to month
    }
    
    // Get purchase transactions within the date range
    const transactions = await prisma.credit_transactions.findMany({
      where: {
        type: CreditTransactionType.PURCHASE,
        createdAt: {
          gte: startDate,
          lte: today
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Group transactions by date
    const revenueByDate = new Map();
    
    transactions.forEach(transaction => {
      const date = transaction.createdAt.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const currentAmount = revenueByDate.get(date) || 0;
      revenueByDate.set(date, currentAmount + transaction.amount);
    });
    
    // Convert to array format for the chart
    const revenueData = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
    
    // Calculate totals and average
    const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const dailyAverage = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
    
    return NextResponse.json({
      revenueData,
      totalRevenue,
      dailyAverage,
      period
    });
    
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
} 
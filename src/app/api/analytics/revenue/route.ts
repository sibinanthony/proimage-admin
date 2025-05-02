import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreditTransactionType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'thisMonth';
    
    // Calculate start date based on period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    let startDate = new Date();
    let endDate = new Date(now.getTime()); // Clone current date
    
    switch (period) {
      case 'today': {
        startDate = today;
        break;
      }
      case 'thisWeek': {
        // Start of current week (Sunday)
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'thisMonth': {
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      }
      case 'lastMonth': {
        // Start of last month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0); // End of last month
        break;
      }
      case 'thisYear': {
        // Start of current year
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      }
      case 'allTime': {
        // Just use a very old date for all time
        startDate = new Date(2000, 0, 1);
        break;
      }
      default: {
        // Default to this month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }
    
    // Get purchase transactions within the date range
    const transactions = await prisma.credit_transactions.findMany({
      where: {
        type: CreditTransactionType.PURCHASE,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Group transactions by date
    const revenueByDate = new Map();
    
    // For empty periods, generate empty data for visualization
    if (transactions.length === 0) {
      // Create a few data points for the empty chart
      const numDays = period === 'today' ? 1 : 
                      period === 'thisWeek' ? 7 : 
                      period === 'thisMonth' || period === 'lastMonth' ? 30 : 
                      period === 'thisYear' ? 12 : 7;
                      
      const intervalType = period === 'thisYear' ? 'month' : 'day';
      
      if (intervalType === 'day') {
        for (let i = 0; i < numDays; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          if (date <= endDate) {
            revenueByDate.set(date.toISOString().split('T')[0], 0);
          }
        }
      } else {
        // Month intervals for year view
        for (let i = 0; i < numDays; i++) {
          const date = new Date(startDate);
          date.setMonth(date.getMonth() + i);
          if (date <= endDate) {
            revenueByDate.set(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, 0);
          }
        }
      }
    } else {
      // Process actual transactions
      transactions.forEach(transaction => {
        const txDate = transaction.createdAt;
        let dateKey;
        
        if (period === 'thisYear') {
          // Group by month for year view
          dateKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        } else {
          // Group by day for all other views
          dateKey = txDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        
        const currentAmount = revenueByDate.get(dateKey) || 0;
        revenueByDate.set(dateKey, currentAmount + transaction.amount);
      });
    }
    
    // Convert to array format for the chart
    const revenueData = Array.from(revenueByDate.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, revenue]) => ({
        date,
        revenue,
      }));
    
    // Calculate totals and average
    const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalDays = period === 'today' ? 1 :
                     Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverage = totalDays > 0 ? totalRevenue / totalDays : 0;
    
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
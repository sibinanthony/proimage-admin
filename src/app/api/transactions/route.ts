import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreditTransactionType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '10');
    const page = Number(searchParams.get('page') || '1');
    const typeParam = searchParams.get('type');
    
    const skip = (page - 1) * limit;
    
    // Build the query conditions with proper typing
    const where = typeParam ? { 
      type: typeParam as CreditTransactionType 
    } : {};
    
    // Get transactions with pagination
    const transactions = await prisma.credit_transactions.findMany({
      where,
      include: {
        stores: {
          select: {
            name: true
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
      type: transaction.type,
      amount: transaction.type === CreditTransactionType.USAGE ? -Math.abs(transaction.amount) : transaction.amount,
      price: 0, // This would need to be calculated from the credit package price
      date: transaction.createdAt,
      description: transaction.description
    }));
    
    // Get total count for pagination
    const totalCount = await prisma.credit_transactions.count({ where });
    
    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        total: totalCount,
        page,
        pageSize: limit,
        pageCount: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
} 
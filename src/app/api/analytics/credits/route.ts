import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreditTransactionType } from '@prisma/client';

export async function GET() {
  try {
    // Get total credits sold via purchases only
    const purchaseCredits = await prisma.credit_transactions.aggregate({
      where: {
        type: CreditTransactionType.PURCHASE
      },
      _sum: {
        amount: true
      }
    });
    
    // Get total credits including promotional/free credits
    const allCredits = await prisma.credit_transactions.aggregate({
      where: {
        OR: [
          { type: CreditTransactionType.PURCHASE },
          { type: CreditTransactionType.PROMOTIONAL },
          { type: CreditTransactionType.INITIAL_FREE },
          { type: CreditTransactionType.FREE_ACTIVATION }
        ]
      },
      _sum: {
        amount: true
      }
    });
    
    // Get total credits used (all USAGE transactions)
    const creditsUsed = await prisma.credit_transactions.aggregate({
      where: {
        type: CreditTransactionType.USAGE
      },
      _sum: {
        amount: true
      }
    });
    
    // Get credits by type
    const creditsByType = await Promise.all(
      Object.values(CreditTransactionType).map(async (type) => {
        const result = await prisma.credit_transactions.aggregate({
          where: { type },
          _sum: { amount: true },
          _count: true
        });
        
        return {
          type,
          amount: Math.abs(result._sum.amount || 0),
          count: result._count
        };
      })
    );
    
    // Calculate remaining credits
    const totalSold = allCredits._sum.amount || 0;
    const purchaseTotal = purchaseCredits._sum.amount || 0;
    const totalUsed = Math.abs(creditsUsed._sum.amount || 0);
    const remaining = totalSold - totalUsed;
    
    // Get credits remaining by store
    const storeCredits = await prisma.store_credits.findMany({
      include: {
        stores: {
          select: {
            name: true,
            domain: true
          }
        }
      },
      orderBy: {
        creditsRemaining: 'desc'
      },
      take: 10
    });
    
    const storeCreditsData = storeCredits.map(credit => ({
      storeId: credit.storeId,
      storeName: credit.stores.name,
      domain: credit.stores.domain,
      creditsRemaining: credit.creditsRemaining,
      totalPurchased: credit.totalCreditsPurchased
    }));
    
    return NextResponse.json({
      totalSold,
      purchaseTotal,
      totalUsed,
      remaining,
      percentUsed: totalSold > 0 ? (totalUsed / totalSold) * 100 : 0,
      percentRemaining: totalSold > 0 ? (remaining / totalSold) * 100 : 0,
      creditsByType,
      storeCredits: storeCreditsData
    });
    
  } catch (error) {
    console.error('Error fetching credit analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit analytics' },
      { status: 500 }
    );
  }
} 
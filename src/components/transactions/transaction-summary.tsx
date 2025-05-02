"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditTransactionType } from '@prisma/client';
import { formatNumber } from '@/lib/utils';

interface TransactionSummaryProps {
  summary: {
    totalTransactions: number;
    totalPurchased: number;
    totalUsed: number;
    transactions: Record<string, { count: number; amount: number }>;
  };
}

// Format transaction type for display
function formatTransactionType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get color for transaction type
function getTypeColor(type: string): string {
  switch (type) {
    case CreditTransactionType.PURCHASE:
      return 'text-blue-600';
    case CreditTransactionType.USAGE:
      return 'text-amber-600';
    case CreditTransactionType.PROMOTIONAL:
      return 'text-purple-600';
    case CreditTransactionType.INITIAL_FREE:
      return 'text-emerald-600';
    case CreditTransactionType.REFUND:
      return 'text-red-600';
    case CreditTransactionType.FREE_ACTIVATION:
      return 'text-teal-600';
    default:
      return 'text-gray-600';
  }
}

export function TransactionSummary({ summary }: TransactionSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Credits Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Purchased</p>
              <p className="text-2xl font-bold">{formatNumber(summary.totalPurchased)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Used</p>
              <p className="text-2xl font-bold">{formatNumber(summary.totalUsed)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Credits</p>
              <p className="text-2xl font-bold">{formatNumber(summary.totalPurchased - summary.totalUsed)}</p>
            </div>
          </div>
          
          {summary.totalPurchased > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Used</span>
                <span>Available</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ 
                    width: `${Math.min((summary.totalUsed / summary.totalPurchased) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatNumber(summary.totalUsed)} credits</span>
                <span>{formatNumber(summary.totalPurchased - summary.totalUsed)} credits remaining</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transaction Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(summary.transactions).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-md">
                  <div>
                    <p className={`text-sm font-medium ${getTypeColor(type)}`}>
                      {formatTransactionType(type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.count} transactions
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {formatNumber(data.amount)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-lg font-bold">{formatNumber(summary.totalTransactions)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
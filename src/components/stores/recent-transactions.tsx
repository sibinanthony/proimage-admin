"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { CreditTransactionType } from '@prisma/client';
import { ArrowRightIcon } from '@radix-ui/react-icons';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  storeId: string;
}

export function RecentTransactions({ transactions, storeId }: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link
            href={`/transactions?storeId=${storeId}`}
            className="text-sm text-primary hover:underline inline-flex items-center"
          >
            View All <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No transactions found for this store.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Link
          href={`/transactions?storeId=${storeId}`}
          className="text-sm text-primary hover:underline inline-flex items-center"
        >
          View All <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b border-muted pb-3 last:border-none last:pb-0"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${getTypeStyles(transaction.type)}`}
                  >
                    {formatTransactionType(transaction.type)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(transaction.date, 'PPP')}
                  </span>
                </div>
                {transaction.description && (
                  <span className="text-xs text-muted-foreground">{transaction.description}</span>
                )}
              </div>
              <div className={`text-sm font-medium ${transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getTypeStyles(type: string): string {
  switch (type) {
    case CreditTransactionType.PURCHASE:
      return 'bg-blue-100 text-blue-800';
    case CreditTransactionType.USAGE:
      return 'bg-amber-100 text-amber-800';
    case CreditTransactionType.PROMOTIONAL:
      return 'bg-purple-100 text-purple-800';
    case CreditTransactionType.INITIAL_FREE:
      return 'bg-emerald-100 text-emerald-800';
    case CreditTransactionType.REFUND:
      return 'bg-red-100 text-red-800';
    case CreditTransactionType.FREE_ACTIVATION:
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatTransactionType(type: string): string {
  // Convert SNAKE_CASE to Title Case
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 
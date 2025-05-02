"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  storeId: string;
  storeName: string;
  type: string;
  amount: number;
  price: number;
  date: string;
  description?: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch('/api/transactions?limit=5');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data: TransactionsResponse = await response.json();
        setTransactions(data.transactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Could not load transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded bg-muted animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.storeName}
                  </TableCell>
                  <TableCell>
                    <span className={getTypeClasses(transaction.type)}>
                      {formatTransactionType(transaction.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={transaction.amount > 0 ? "text-emerald-600" : transaction.amount < 0 ? "text-red-600" : ""}>
                      {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.price > 0
                      ? formatCurrency(transaction.price)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate(transaction.date, "PP")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function getTypeClasses(type: string) {
  switch (type) {
    case 'PURCHASE':
      return 'inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800';
    case 'USAGE':
      return 'inline-block px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800';
    case 'PROMOTIONAL':
      return 'inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800';
    case 'REFUND':
      return 'inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-800';
    default:
      return 'inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800';
  }
}

function formatTransactionType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
} 
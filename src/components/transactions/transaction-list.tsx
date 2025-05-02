"use client";

import React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatNumber } from '@/lib/utils';
import { CreditTransactionType } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  storeId: string;
  storeName: string;
  storeDomain: string;
  type: string;
  amount: number;
  description: string | null;
  shopifyChargeId: string | null;
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

// Format transaction type for display
function formatTransactionType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get background color class for transaction type
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

export function TransactionList({ 
  transactions, 
  pagination, 
  onPageChange,
  onPageSizeChange,
  isLoading = false 
}: TransactionListProps) {
  
  // Generate an array of page numbers to display in pagination
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const { page, pageCount } = pagination;
    
    if (pageCount <= maxVisiblePages) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    
    const leftSide = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const rightSide = Math.min(pageCount, leftSide + maxVisiblePages - 1);
    
    return Array.from(
      { length: rightSide - leftSide + 1 },
      (_, i) => leftSide + i
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDate(transaction.date, 'PPp')}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/stores/${transaction.storeId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {transaction.storeName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{transaction.storeDomain}</p>
                    </TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyles(transaction.type)}`}
                      >
                        {formatTransactionType(transaction.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">
                        {transaction.description || 'No description'}
                      </div>
                      {transaction.shopifyChargeId && (
                        <p className="text-xs text-muted-foreground">
                          ID: {transaction.shopifyChargeId}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {transaction.amount > 0 ? '+' : ''}{formatNumber(transaction.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found matching your criteria.
          </div>
        )}
      </CardContent>
      
      {transactions.length > 0 && pagination.pageCount > 1 && (
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {transactions.length} of {pagination.total} transactions
            </div>
            
            {onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue placeholder={pagination.pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pageCount}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 
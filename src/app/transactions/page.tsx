"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { TransactionList } from '@/components/transactions/transaction-list';
import { TransactionSummary } from '@/components/transactions/transaction-summary';

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

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

interface Store {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: 20,
    pageCount: 0
  });
  const [filters, setFilters] = useState({
    period: searchParams.get('period') || 'thisMonth',
    type: searchParams.get('type') || '',
    storeId: searchParams.get('storeId') || '',
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  });
  const [stores, setStores] = useState<Store[]>([]);

  // Fetch stores for the filter dropdown
  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch('/api/stores/list');
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        const data = await response.json();
        setStores(data);
      } catch (err) {
        console.error('Error fetching stores:', err);
      }
    }

    fetchStores();
  }, []);

  // Fetch transactions with current filters and pagination
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        
        // Build the query URL with all filters
        const params = new URLSearchParams();
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.pageSize.toString());
        
        // Add active filters to params
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
        
        const response = await fetch(`/api/transactions?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const data = await response.json();
        setTransactions(data.transactions);
        setPagination(data.pagination);
        setSummary(data.summary);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Could not load transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [pagination.page, filters]);

  // Default summary state
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalPurchased: 0,
    totalUsed: 0,
    transactions: {}
  });

  // Handle page change for pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    // Reset to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="container py-6 space-y-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      
      <TransactionFilters 
        stores={stores}
        onFilterChange={handleFilterChange}
        initialFilters={filters}
        isLoading={loading}
      />
      
      <TransactionSummary summary={summary} />
      
      <TransactionList 
        transactions={transactions}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={loading}
      />
    </div>
  );
} 
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StoreSummary } from '@/components/stores/store-summary';
import { CreditSummary } from '@/components/stores/credit-summary';
import { CreditUsageChart } from '@/components/stores/credit-usage-chart';
import { RecentTransactions } from '@/components/stores/recent-transactions';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

interface StoreData {
  id: string;
  shopifyId: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastActiveDate: string;
  credits: {
    remaining: number;
    totalPurchased: number;
    totalUsed: number;
    utilizationRate: number;
  };
  stats: {
    totalProducts: number;
    totalJobs: number;
    totalImages: number;
    jobStatusCounts: Record<string, number>;
  };
  charts: {
    monthlyCredits: Array<{
      month: string;
      purchased: number;
      used: number;
    }>;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    date: string;
  }>;
}

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStoreData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/stores/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Store not found');
          }
          throw new Error('Failed to fetch store data');
        }
        
        const data = await response.json();
        setStore(data);
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError(`${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchStoreData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link
            href="/stores"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-muted hover:bg-muted/80 h-8 px-3 py-2"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Stores
          </Link>
        </div>
        <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link
            href="/stores"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-muted hover:bg-muted/80 h-8 px-3 py-2"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Stores
          </Link>
        </div>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <h2 className="text-lg font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link
          href="/stores"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-muted hover:bg-muted/80 h-8 px-3 py-2"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Stores
        </Link>
      </div>
      
      <StoreSummary
        name={store.name}
        domain={store.domain}
        shopifyId={store.shopifyId}
        isActive={store.isActive}
        lastActiveDate={store.lastActiveDate}
        createdAt={store.createdAt}
        totalProducts={store.stats.totalProducts}
        totalJobs={store.stats.totalJobs}
        totalImages={store.stats.totalImages}
        jobStatusCounts={store.stats.jobStatusCounts}
        storeId={store.id}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <CreditSummary
          remaining={store.credits.remaining}
          totalPurchased={store.credits.totalPurchased}
          totalUsed={store.credits.totalUsed}
          utilizationRate={store.credits.utilizationRate}
        />
        
        <RecentTransactions
          transactions={store.recentTransactions}
          storeId={store.id}
        />
      </div>
      
      <CreditUsageChart
        data={store.charts.monthlyCredits}
      />
    </div>
  );
} 
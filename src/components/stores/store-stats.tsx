"use client";

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface StoreStats {
  total: number;
  active: number;
  inactive: number;
  withRecentJobs: number;
  withRecentTransactions: number;
  zeroCredits: number;
  lowCredits: number;
  newToday: number;
  newLastWeek: number;
  newLastMonth: number;
}

export function StoreStats() {
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStoreStats() {
      try {
        const response = await fetch('/api/stores/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch store statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching store statistics:', err);
        setError('Could not load store statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStoreStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted animate-pulse rounded w-12"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return null; // Don't show error to keep the UI clean, just skip this section
  }

  if (!stats) {
    return null;
  }

  const activePercentage = stats.total > 0 
    ? Math.round((stats.active / stats.total) * 100) 
    : 0;

  const inactivePercentage = stats.total > 0 
    ? Math.round((stats.inactive / stats.total) * 100) 
    : 0;

  const lowCreditsPercentage = stats.total > 0 
    ? Math.round(((stats.zeroCredits + stats.lowCredits) / stats.total) * 100) 
    : 0;

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.total)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.newToday} new today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.active)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activePercentage}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Inactive Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.inactive)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {inactivePercentage}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Low/No Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.zeroCredits + stats.lowCredits)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {lowCreditsPercentage}% of total
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 
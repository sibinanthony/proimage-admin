"use client";

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency, formatNumber, calculatePercentChange } from '@/lib/utils';
import {
  PieChartIcon,
  PersonIcon,
  ImageIcon,
  CubeIcon,
} from '@radix-ui/react-icons';

interface DashboardData {
  totalStores: number;
  newStoresToday: number;
  totalRevenue: number;
  creditsUsed: number;
  totalJobs: number;
  completedJobs: number;
  
  storesOneWeekAgo: number;
  newStoresYesterday: number;
  prevMonthRevenue: number;
  prevMonthCreditsUsed: number;
}

export function OverviewStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  if (!data) {
    return null;
  }

  const storeGrowthPercent = calculatePercentChange(data.totalStores, data.storesOneWeekAgo);
  const newStoreGrowthPercent = calculatePercentChange(data.newStoresToday, data.newStoresYesterday);
  const revenueGrowthPercent = calculatePercentChange(data.totalRevenue, data.prevMonthRevenue);
  const creditUsageGrowthPercent = calculatePercentChange(data.creditsUsed, data.prevMonthCreditsUsed);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Stores"
        value={formatNumber(data.totalStores)}
        description="Compared to last week"
        percentageChange={storeGrowthPercent}
        icon={<PersonIcon />}
      />
      <StatCard
        title="New Stores"
        value={data.newStoresToday}
        description="Compared to yesterday"
        percentageChange={newStoreGrowthPercent}
        icon={<PersonIcon />}
      />
      <StatCard
        title="Revenue (Purchase Credits)"
        value={formatCurrency(data.totalRevenue)}
        description="Compared to last month"
        percentageChange={revenueGrowthPercent}
        icon={<PieChartIcon />}
      />
      <StatCard
        title="Credits Used"
        value={formatNumber(data.creditsUsed)}
        description="Compared to last month"
        percentageChange={creditUsageGrowthPercent}
        icon={<CubeIcon />}
      />
      <StatCard
        title="Jobs Completed"
        value={`${formatNumber(data.completedJobs)}/${formatNumber(
          data.totalJobs
        )}`}
        description={`${data.totalJobs > 0 
          ? Math.round((data.completedJobs / data.totalJobs) * 100) 
          : 100}% success rate`}
        icon={<ImageIcon />}
      />
    </div>
  );
} 
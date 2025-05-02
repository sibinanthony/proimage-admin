"use client";

import React from 'react';
import { OverviewStats } from '@/components/dashboard/overview-stats';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { RevenueChart } from '@/components/analytics/revenue-chart';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <OverviewStats />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-2 lg:col-span-4">
          <RevenueChart />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
} 
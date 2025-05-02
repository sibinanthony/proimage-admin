"use client";

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ChartDataItem {
  date: string;
  revenue: number;
}

interface RevenueData {
  revenueData: ChartDataItem[];
  totalRevenue: number;
  dailyAverage: number;
  period: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm">{new Date(label).toLocaleDateString()}</p>
        <p className="font-bold text-emerald-500">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }

  return null;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.getDate().toString();
};

export function RevenueChart() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('thisMonth');

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/revenue?period=${period}`);
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data');
        }
        const revenueData = await response.json();
        setData(revenueData);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Could not load revenue data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueData();
  }, [period]);

  // Check if we have any revenue data
  const hasRevenueData = data && data.revenueData && data.revenueData.length > 0;

  // Get period display name
  const getPeriodDisplayName = (period: string) => {
    switch (period) {
      case 'today': return 'Today';
      case 'thisWeek': return 'This Week';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'thisYear': return 'This Year';
      case 'allTime': return 'All Time';
      default: return 'This Month';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
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
        <div className="flex justify-between items-center">
          <CardTitle>Revenue Overview</CardTitle>
          <Select 
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={getPeriodDisplayName(period)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">
              {hasRevenueData ? formatCurrency(data!.totalRevenue) : '$0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-bold">
              {hasRevenueData ? formatCurrency(data!.dailyAverage) : '$0.00'}
            </p>
          </div>
        </div>
        {!hasRevenueData ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No purchase transactions found for the selected period.
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data!.revenueData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#888888"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  stroke="#888888"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="#10b98120"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
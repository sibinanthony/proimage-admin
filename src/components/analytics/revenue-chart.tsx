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
  const [period, setPeriod] = useState<string>('month');

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
        <CardTitle className="flex justify-between items-center">
          <span>Revenue Overview</span>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm rounded-md border border-input bg-transparent px-3 py-1"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="quarter">Past Quarter</option>
            <option value="year">Past Year</option>
          </select>
        </CardTitle>
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
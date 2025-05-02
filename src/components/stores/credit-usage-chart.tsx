"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyCreditData {
  month: string;
  purchased: number;
  used: number;
}

interface CreditUsageChartProps {
  data: MonthlyCreditData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value} credits
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export function CreditUsageChart({ data }: CreditUsageChartProps) {
  const formattedData = data.map(item => {
    // Format month from YYYY-MM to more readable format (e.g., Jan 2023)
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const formattedMonth = date.toLocaleString('default', { month: 'short' });
    
    return {
      month: `${formattedMonth} ${year}`,
      purchased: item.purchased,
      used: item.used,
      balance: item.purchased - item.used
    };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Credit Usage History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="purchased" stackId="a" fill="#4f46e5" name="Credits Purchased" />
              <Bar dataKey="used" stackId="a" fill="#ef4444" name="Credits Used" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 
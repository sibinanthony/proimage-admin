"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  percentageChange?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  percentageChange,
  icon,
  className,
}: StatCardProps) {
  const isPositive = percentageChange && percentageChange > 0;
  const isNegative = percentageChange && percentageChange < 0;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {percentageChange !== undefined && (
          <p className="flex items-center text-xs text-muted-foreground mt-1">
            {isPositive && (
              <ArrowUpIcon className="mr-1 h-4 w-4 text-emerald-500" />
            )}
            {isNegative && (
              <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span
              className={cn(
                "font-medium",
                isPositive && "text-emerald-500",
                isNegative && "text-red-500"
              )}
            >
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
            {description && (
              <span className="ml-1 text-muted-foreground">{description}</span>
            )}
          </p>
        )}
        {!percentageChange && description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
} 
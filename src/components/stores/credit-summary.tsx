"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface CreditSummaryProps {
  remaining: number;
  totalPurchased: number;
  totalUsed: number;
  utilizationRate: number;
}

export function CreditSummary({ 
  remaining, 
  totalPurchased, 
  totalUsed, 
  utilizationRate 
}: CreditSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-2xl font-bold ${remaining < 10 ? 'text-amber-500' : remaining > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatNumber(remaining)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Purchased</p>
            <p className="text-2xl font-bold">
              {formatNumber(totalPurchased)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Used</p>
            <p className="text-2xl font-bold">
              {formatNumber(totalUsed)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Utilization Rate</p>
            <p className="text-2xl font-bold">
              {Math.round(utilizationRate)}%
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Used</span>
            <span>Available</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            {totalPurchased > 0 && (
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatNumber(totalUsed)} credits</span>
            <span>{formatNumber(totalPurchased - totalUsed)} credits remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
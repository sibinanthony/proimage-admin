"use client";

import React, { useEffect, useState } from 'react';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface CreditAnalytics {
  totalSold: number;
  purchaseTotal: number;
  totalUsed: number;
  remaining: number;
  percentUsed: number;
  percentRemaining: number;
  creditsByType: Array<{
    type: string;
    amount: number;
    count: number;
  }>;
  storeCredits: Array<{
    storeId: string;
    storeName: string;
    domain: string;
    creditsRemaining: number;
    totalPurchased: number;
  }>;
}

export default function AnalyticsPage() {
  const [creditData, setCreditData] = useState<CreditAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreditData() {
      try {
        const response = await fetch('/api/analytics/credits');
        if (!response.ok) {
          throw new Error('Failed to fetch credit analytics');
        }
        const data = await response.json();
        setCreditData(data);
      } catch (err) {
        console.error('Error fetching credit analytics:', err);
        setError('Could not load credit analytics. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCreditData();
  }, []);

  // Calculate average order value
  const calculateAverageOrderValue = () => {
    if (!creditData) return '$0.00';
    
    const purchaseType = creditData.creditsByType.find(c => c.type === 'PURCHASE');
    if (!purchaseType || purchaseType.count === 0) return '$0.00';
    
    return formatCurrency(creditData.purchaseTotal / purchaseType.count);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <p className="text-muted-foreground">
        Financial and usage analytics for the ProImage platform.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-12 rounded bg-muted animate-pulse"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {creditData ? formatCurrency(creditData.purchaseTotal) : '$0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {creditData ? formatNumber(creditData.purchaseTotal) : '0'} credits purchased
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-12 rounded bg-muted animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold">
                {calculateAverageOrderValue()}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Store Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-12 rounded bg-muted animate-pulse"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {creditData?.storeCredits?.length || 0}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block text-foreground font-medium">
                      {creditData?.storeCredits?.filter(s => s.creditsRemaining > 0).length || 0}
                    </span>
                    <span>Active stores</span>
                  </div>
                  <div>
                    <span className="block text-foreground font-medium">
                      {creditData?.storeCredits?.filter(s => s.creditsRemaining === 0).length || 0}
                    </span>
                    <span>Inactive stores</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        
        <Card>
          <CardHeader>
            <CardTitle>Credit Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 rounded bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
            ) : creditData ? (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Credits Sold</p>
                    <p className="text-sm text-muted-foreground">{formatNumber(creditData.totalSold)}</p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: '100%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Credits Used</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(creditData.totalUsed)} 
                      ({Math.round(creditData.percentUsed)}%)
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div 
                      className="h-2 rounded-full bg-blue-500" 
                      style={{ width: `${creditData.percentUsed}%` }} 
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Credits Remaining</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(creditData.remaining)}
                      ({Math.round(creditData.percentRemaining)}%)
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div 
                      className="h-2 rounded-full bg-amber-500" 
                      style={{ width: `${creditData.percentRemaining}%` }} 
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
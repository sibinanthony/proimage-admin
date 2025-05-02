"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { 
  CheckCircledIcon, 
  CrossCircledIcon,
  GlobeIcon,
  CalendarIcon,
  IdCardIcon
} from '@radix-ui/react-icons';

interface StoreSummaryProps {
  name: string;
  domain: string;
  shopifyId: string;
  isActive: boolean;
  lastActiveDate: string;
  createdAt: string;
  totalProducts: number;
  totalJobs: number;
  totalImages: number;
  jobStatusCounts: Record<string, number>;
}

export function StoreSummary({
  name,
  domain,
  shopifyId,
  isActive,
  lastActiveDate,
  createdAt,
  totalProducts,
  totalJobs,
  totalImages,
  jobStatusCounts
}: StoreSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">{name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <GlobeIcon className="h-3 w-3" />
                <span>{domain}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IdCardIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Shopify ID</p>
                  <p className="text-sm text-muted-foreground">{shopifyId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(createdAt, 'PPP')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isActive ? (
                  <CheckCircledIcon className="h-4 w-4 text-emerald-500" />
                ) : (
                  <CrossCircledIcon className="h-4 w-4 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Active' : 'Inactive'} • Last active {formatDate(lastActiveDate, 'PP')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Jobs</p>
                <p className="text-2xl font-bold">{totalJobs}</p>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Images</p>
                <p className="text-2xl font-bold">{totalImages}</p>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {totalJobs > 0 
                    ? Math.round((jobStatusCounts['COMPLETED'] || 0) / totalJobs * 100) 
                    : 0}%
                </p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Job Status</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-sm font-medium">{jobStatusCounts['COMPLETED'] || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-medium">{jobStatusCounts['PENDING'] || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Processing</p>
                  <p className="text-sm font-medium">{jobStatusCounts['PROCESSING'] || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className="text-sm font-medium">{jobStatusCounts['FAILED'] || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
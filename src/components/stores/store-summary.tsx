"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { 
  CheckCircledIcon, 
  CrossCircledIcon,
  GlobeIcon,
  CalendarIcon,
  IdCardIcon,
  CubeIcon,
  ImageIcon,
  RocketIcon,
  InfoCircledIcon
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
  storeId: string;
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
  jobStatusCounts,
  storeId
}: StoreSummaryProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <GlobeIcon className="mr-2 h-5 w-5" />
              {name}
            </CardTitle>
            <div className="flex items-center">
              <div className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                isActive 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
              }`}>
                {isActive 
                  ? <><CheckCircledIcon className="mr-1 h-3 w-3" /> Active</> 
                  : <><CrossCircledIcon className="mr-1 h-3 w-3" /> Inactive</>}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{domain}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Left Column - Compact Store Details (5 columns) */}
          <div className="md:col-span-5 bg-muted/20 p-2.5 rounded-md">
            <h4 className="text-xs font-medium flex items-center gap-1 mb-2 text-muted-foreground">
              <InfoCircledIcon className="h-3.5 w-3.5" />
              Store Details
            </h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="text-xs truncate" title={shopifyId}>{shopifyId}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-xs">{formatDate(createdAt, 'PP')}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Last Active</p>
                <p className="text-xs">{formatDate(lastActiveDate, 'PP')}</p>
              </div>
            </div>
          </div>
          
          {/* Stats - 7 columns in 4 cells */}
          <div className="md:col-span-7 grid grid-cols-4 gap-3">
            <div className="bg-muted/20 p-2.5 rounded-md flex flex-col justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CubeIcon className="h-3 w-3" />
                Products
              </p>
              <p className="text-lg font-bold mt-1">{totalProducts}</p>
            </div>
            
            <div className="bg-muted/20 p-2.5 rounded-md flex flex-col justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <RocketIcon className="h-3 w-3" />
                Jobs
              </p>
              <p className="text-lg font-bold mt-1">{totalJobs}</p>
            </div>
            
            <div className="bg-muted/20 p-2.5 rounded-md flex flex-col justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                Images
              </p>
              <div className="flex justify-between items-end mt-1">
                <p className="text-lg font-bold">{totalImages}</p>
                {totalImages > 0 && (
                  <Link
                    href={`/stores/${storeId}/images`}
                    className="text-xs text-primary hover:underline"
                  >
                    View All
                  </Link>
                )}
              </div>
            </div>
            
            <div className="bg-muted/20 p-2.5 rounded-md flex flex-col justify-between">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-lg font-bold mt-1">
                {totalJobs > 0 
                  ? Math.round((jobStatusCounts['COMPLETED'] || 0) / totalJobs * 100) 
                  : 0}%
              </p>
            </div>
          </div>
          
          {/* Job Status Rows - Full Width */}
          <div className="md:col-span-12 bg-muted/20 p-2.5 rounded-md">
            <h4 className="text-xs font-medium flex items-center gap-1 mb-2 text-muted-foreground">
              <RocketIcon className="h-3.5 w-3.5" />
              Job Status Breakdown
            </h4>
            
            <div className="grid grid-cols-4 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-sm font-medium">{jobStatusCounts['PENDING'] || 0}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Processing</p>
                <p className="text-sm font-medium">{jobStatusCounts['PROCESSING'] || 0}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm font-medium">{jobStatusCounts['COMPLETED'] || 0}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-sm font-medium">{jobStatusCounts['FAILED'] || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
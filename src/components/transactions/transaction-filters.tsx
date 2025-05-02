"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { CalendarIcon, ReloadIcon } from "@radix-ui/react-icons";
import { CreditTransactionType } from '@prisma/client';

// Format the enum values for display
function formatTransactionType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface Store {
  id: string;
  name: string;
}

interface TransactionFiltersProps {
  stores: Store[];
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
  isLoading?: boolean;
}

export function TransactionFilters({ 
  stores, 
  onFilterChange, 
  initialFilters = {}, 
  isLoading = false 
}: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for filters
  const [period, setPeriod] = useState<string>(initialFilters.period || searchParams.get('period') || 'thisMonth');
  const [type, setType] = useState<string>(initialFilters.type || searchParams.get('type') || 'all');
  const [storeId, setStoreId] = useState<string>(initialFilters.storeId || searchParams.get('storeId') || 'all');
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialFilters.startDate || searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate') as string) 
      : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialFilters.endDate || searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate') as string) 
      : undefined
  );

  // Update URL and trigger filter change
  const applyFilters = () => {
    const filters = {
      period,
      type: type !== 'all' ? type : undefined,
      storeId: storeId !== 'all' ? storeId : undefined,
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
    );
    
    // Build URL query params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    // Update URL
    router.push(`/transactions?${params.toString()}`);
    
    // Notify parent component
    onFilterChange(filters);
  };
  
  const resetFilters = () => {
    setPeriod('thisMonth');
    setType('all');
    setStoreId('all');
    setStartDate(undefined);
    setEndDate(undefined);
    
    router.push('/transactions');
    onFilterChange({
      period: 'thisMonth'
    });
  };
  
  // Apply filters on mount and when URL changes
  useEffect(() => {
    applyFilters();
  }, [period, type, storeId]); // Intentionally not including dates - they need explicit apply

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="period">Time Period</Label>
          <Select
            value={period}
            onValueChange={setPeriod}
            disabled={isLoading}
          >
            <SelectTrigger id="period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="last6Months">Last 6 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="type">Transaction Type</Label>
          <Select
            value={type}
            onValueChange={setType}
            disabled={isLoading}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(CreditTransactionType).map((type) => (
                <SelectItem key={type} value={type}>
                  {formatTransactionType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="store">Store</Label>
          <Select
            value={storeId}
            onValueChange={setStoreId}
            disabled={isLoading}
          >
            <SelectTrigger id="store">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end space-x-2">
          <Button 
            onClick={resetFilters} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </div>
      
      {period === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <div className="relative">
              <DatePicker
                date={startDate}
                setDate={(date) => setStartDate(date || undefined)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <div className="relative">
              <DatePicker
                date={endDate}
                setDate={(date) => setEndDate(date || undefined)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="col-span-2 flex justify-end">
            <Button 
              onClick={applyFilters} 
              disabled={isLoading}
            >
              {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Apply Date Range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 
"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface Store {
  id: string;
  shopifyId: string;
  name: string;
  domain: string;
  creditsRemaining: number;
  totalProducts: number;
  totalJobs: number;
  createdAt: string;
}

interface StoresResponse {
  stores: Store[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

export function StoreList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true);
        const url = debouncedSearch
          ? `/api/stores?search=${encodeURIComponent(debouncedSearch)}`
          : '/api/stores';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        const data: StoresResponse = await response.json();
        setStores(data.stores);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Could not load stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, [debouncedSearch]);

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stores</CardTitle>
          <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search stores..."
              className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stores</CardTitle>
        <div className="relative w-64">
          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search stores..."
            className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length > 0 ? (
                stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">
                      {store.name}
                    </TableCell>
                    <TableCell>{store.domain}</TableCell>
                    <TableCell className={store.creditsRemaining < 10 ? "text-amber-600 font-medium" : ""}>
                      {store.creditsRemaining}
                    </TableCell>
                    <TableCell>{store.totalProducts}</TableCell>
                    <TableCell>{store.totalJobs}</TableCell>
                    <TableCell className="text-right">
                      {formatDate(store.createdAt, "PP")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No stores found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 
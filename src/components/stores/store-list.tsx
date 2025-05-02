"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { 
  MagnifyingGlassIcon, 
  CheckCircledIcon, 
  CrossCircledIcon,
  ReloadIcon,
  StackIcon,
  CalendarIcon,
  GlobeIcon,
  PlusCircledIcon,
  MinusCircledIcon
} from '@radix-ui/react-icons';

interface Store {
  id: string;
  shopifyId: string;
  name: string;
  domain: string;
  creditsRemaining: number;
  totalProducts: number;
  totalJobs: number;
  lastJob: string | null;
  lastTransaction: string | null;
  lastActiveDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [creditFilter, setCreditFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeFilter, creditFilter]);

  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true);
        
        // Build the query URL with all filters
        let url = `/api/stores?page=${currentPage}`;
        
        if (debouncedSearch) {
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
        }
        
        if (activeFilter) {
          url += `&active=${activeFilter}`;
        }
        
        if (creditFilter) {
          url += `&credits=${creditFilter}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        const data: StoresResponse = await response.json();
        setStores(data.stores);
        setTotalPages(data.pagination.pageCount);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Could not load stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, [debouncedSearch, activeFilter, creditFilter, currentPage]);

  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4">
        <div className="flex flex-row items-center justify-between">
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
        </div>
        
        {/* Filters */}
        <div className="flex flex-row gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Status:</label>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="">All Stores</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Credits:</label>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={creditFilter}
              onChange={(e) => setCreditFilter(e.target.value)}
            >
              <option value="">All Credits</option>
              <option value="zero">No Credits</option>
              <option value="low">Low Credits (&lt;10)</option>
              <option value="high">High Credits (50+)</option>
            </select>
          </div>
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
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Info</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{store.name}</span>
                          <span className="text-xs text-muted-foreground">ID: {store.shopifyId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GlobeIcon className="h-3 w-3 text-muted-foreground" />
                          {store.domain}
                        </div>
                      </TableCell>
                      <TableCell>
                        {store.isActive ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <CheckCircledIcon className="h-4 w-4" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <CrossCircledIcon className="h-4 w-4" />
                            <span>Inactive</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={store.creditsRemaining < 10 ? "text-amber-600 font-medium" : ""}>
                        <div className="flex items-center gap-1">
                          <StackIcon className="h-3 w-3 text-muted-foreground" />
                          {store.creditsRemaining}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <PlusCircledIcon className="h-3 w-3 text-muted-foreground" />
                          {store.totalProducts}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MinusCircledIcon className="h-3 w-3 text-muted-foreground" />
                          {store.totalJobs}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          {formatDate(store.lastActiveDate, "PP")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(store.createdAt, "PP")}
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/stores/${store.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3 py-2"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No stores found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-md border border-input flex items-center justify-center disabled:opacity-50"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-md border border-input flex items-center justify-center disabled:opacity-50"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 
"use client";

import React from 'react';
import { StoreList } from '@/components/stores/store-list';
import { StoreStats } from '@/components/stores/store-stats';

export default function StoresPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
      <p className="text-muted-foreground">
        View and manage all stores using the ProImage app.
      </p>
      
      <StoreStats />
      <StoreList />
    </div>
  );
} 
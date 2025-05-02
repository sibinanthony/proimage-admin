"use client";

import React from 'react';
import { MainNav } from './main-nav';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container py-2 md:py-0 md:h-16 flex flex-col md:flex-row items-center px-4 sm:px-8">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-6 sm:px-8 md:py-8">
          {children}
        </div>
      </main>
      <footer className="border-t">
        <div className="container py-4 px-4 sm:px-8 text-sm text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} ProImage Admin
        </div>
      </footer>
    </div>
  );
} 
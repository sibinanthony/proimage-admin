"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DashboardIcon, ArchiveIcon, BarChartIcon, CardStackIcon, ExitIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon className="h-4 w-4" />,
  },
  {
    title: 'Stores',
    href: '/stores',
    icon: <ArchiveIcon className="h-4 w-4" />,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: <CardStackIcon className="h-4 w-4" />,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChartIcon className="h-4 w-4" />,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 md:mb-0 md:w-full">
        {/* Logo - visible on all devices */}
        <Link href="/dashboard" className="flex items-center md:min-w-[180px]">
          <span className="font-bold text-sm md:text-base">ProImage Admin</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 ml-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
        
        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary ml-auto md:ml-8"
          aria-label="Logout"
        >
          <ExitIcon className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
      
      {/* Mobile horizontal scroll navigation */}
      <div className="md:hidden w-full overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <nav className="flex gap-4 min-w-max">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1 text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full border",
                pathname === item.href
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:bg-muted/50"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 
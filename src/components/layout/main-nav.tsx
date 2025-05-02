"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DashboardIcon, ArchiveIcon, BarChartIcon } from '@radix-ui/react-icons';

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
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChartIcon className="h-4 w-4" />,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 md:gap-10 items-center">
      <Link href="/dashboard" className="hidden items-center space-x-2 md:flex">
        <span className="hidden font-bold sm:inline-block">ProImage Admin</span>
      </Link>
      <nav className="hidden md:flex gap-6">
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
    </div>
  );
} 
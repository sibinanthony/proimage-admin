"use client";

import { useAuth } from "@/lib/auth-context";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Login page doesn't need protection
  return <>{children}</>;
} 
import type { Metadata, Viewport } from "next";
import { Layout } from "@/components/layout/layout";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProImage Admin",
  description: "Admin dashboard for ProImage Shopify app",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}

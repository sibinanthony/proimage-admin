import { Layout } from "@/components/layout/layout";

export default function StoresLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Layout>{children}</Layout>;
} 
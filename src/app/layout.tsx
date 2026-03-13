import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { TemplatesWorkspaceStateProvider } from "@/features/templates/lib/templates-workspace-state";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Community Algorithm Dashboard",
  description: "Dashboard shell for live tuning Marketplace Resources Algorithm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TemplatesWorkspaceStateProvider>{children}</TemplatesWorkspaceStateProvider>
      </body>
    </html>
  );
}

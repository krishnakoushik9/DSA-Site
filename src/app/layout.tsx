import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "DSA Tracker — SRCS",
  description:
    "A comprehensive DSA scheduler and tracking application for rigorous competitive exam preparation. Track progress across 700+ questions from FINAL450 and Fraz sheets.",
  keywords: [
    "DSA",
    "SRCS",
    "LeetCode",
    "Data Structures",
    "Algorithms",
    "Study Tracker",
  ],
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-nord0 text-nord4 antialiased">
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1c2333',
            color: '#e6edf3',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

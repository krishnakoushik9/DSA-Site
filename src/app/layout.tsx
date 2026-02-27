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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-nord0 text-nord4 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

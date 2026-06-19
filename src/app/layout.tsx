import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NotificationManager from "@/components/NotificationManager";

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 Live Tracker",
  description: "Experience the premium FIFA World Cup 2026 tracker with real-time scoring, groups, team analytics, tournament bracket, match reminders, and localized countdowns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-[#06080d] text-slate-100 min-h-screen flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          <NotificationManager />
          {/* Main Layout Grid */}
          <div className="flex flex-1 flex-col lg:flex-row">
            {/* Nav & Sidebar components */}
            <Navigation />
            
            {/* Scrollable Right Pane */}
            <div className="flex flex-col flex-1 lg:pl-64 pt-16 min-h-screen">
              <main className="flex-1 px-4 py-8 md:px-8 max-w-7xl w-full mx-auto">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}

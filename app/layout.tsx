"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      document.documentElement.style.setProperty('--primary', config.colorPrimario);
      document.documentElement.style.setProperty('--secondary', config.colorSecundario);
    }
  }, []);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {pathname !== '/' && pathname !== '/login' && pathname !== '/register' && <Navbar />}
          <main className="container mx-auto mt-4 px-4">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
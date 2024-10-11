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
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('appConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config?.colorPrimario && config?.colorSecundario) {
          document.documentElement.style.setProperty('--primary', config.colorPrimario);
          document.documentElement.style.setProperty('--secondary', config.colorSecundario);
        }
      }
    }
  }, []);

  const excludedPaths = ['/', '/login', '/register'];
  const shouldShowNavbar = !excludedPaths.includes(pathname);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {shouldShowNavbar && <Navbar />}
          <main className="container mx-auto mt-4 px-4">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean sans-serif font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/providers/AppProviders';

// Using Inter font as a clean sans-serif alternative to Geist if specific variant not available
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Changed variable name to avoid conflict if Geist is still somehow used
});


export const metadata: Metadata = {
  title: 'SBX',
  description: 'SBX: Design and launch powerful surveys with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div id="zoom-wrapper">
          <AppProviders>
            {children}
            <Toaster />
          </AppProviders>
        </div>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CustomCursor } from '@/components/CustomCursor';
import { Preloader } from '@/components/Preloader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Web3 Chat',
  description: 'Secure, decentralized messaging with Web3 wallets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Preloader />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
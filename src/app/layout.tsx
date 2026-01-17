import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ApexFind",
  description: "Find your place with ApexFind",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={`${inter.className} font-body antialiased`}>
        <Header session={session} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

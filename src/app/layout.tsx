import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { FirebaseClientProvider, firebaseConfig } from '@/firebase';

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

  return (
    <html lang="en">
      <body className={`${inter.className} font-body antialiased`}>
        <FirebaseClientProvider options={firebaseConfig}>
          <Header />
          <main>{children}</main>
          <Footer />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

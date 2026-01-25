import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { FirebaseClientProvider } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';
import ReactQueryProvider from '@/components/react-query-provider';

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
      <body className={`${inter.className} font-body antialiased flex flex-col min-h-screen`}>
        <ReactQueryProvider>
          <FirebaseClientProvider options={firebaseConfig}>
            <Header />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
          </FirebaseClientProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

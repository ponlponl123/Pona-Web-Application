import type { Metadata } from "next";
import { Providers } from "./providers";
import localFont from "next/font/local";
import NextTopLoader from 'nextjs-toploader';
import "@/styles/globals.css";

import Header from '@/components/header';
import Footer from '@/components/footer';

const ponlponl123Article = localFont({
  src: "./fonts/Ponlponl123_Article-Regular.woff",
  variable: "--font-ponlponl123-article",
  weight: "100 900",
});
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Pona! - Ponlponl123",
  description: "Pona! is a useful discord application and free to use.",
};

export default function RootLayout(props: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${ponlponl123Article.variable} ${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <NextTopLoader
          color="#ff80c6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 24px #ff80c6,0 0 12px #ff80c6"
        />
        <Providers>
          <Header />
          <main id="app">
            {props.children}
          </main>
          <Footer />
        </Providers>
        {props.modal}
        <div id="modal-root" />
      </body>
    </html>
  );
}

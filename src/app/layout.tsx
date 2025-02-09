import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import NextTopLoader from 'nextjs-toploader';

import "@/styles/globals.css";
import { Providers } from "./providers";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { isMobile } from "@/utils/isMobile";

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

export default async function RootLayout(props: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const mobileCheck = isMobile(userAgent);
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
        <Providers isMobile={mobileCheck}>
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

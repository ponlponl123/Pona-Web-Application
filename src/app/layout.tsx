import localFont from "next/font/local"
import { Geist, JetBrains_Mono } from "next/font/google"

import "@/styles/globals.css"
import NextTopLoader from "nextjs-toploader"
import { ThemeProvider } from "@/components/theme-provider"
import { cn, isMobile } from "@/lib/utils"
import { Metadata } from "next"
import { headers } from "next/headers"
import { Providers } from "./providers"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const fontPonlponl123Article = localFont({
  src: "../fonts/Ponlponl123_Article-Regular.woff",
  variable: "--font-ponlponl123-article",
  weight: "100 900",
})
const fontSNsanafonMaruJ30 = localFont({
  src: "../fonts/SNsanafonMaruJ30.ttf",
  variable: "--font-sn-sanafon-maru-j30",
  weight: "100 900",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Pona! - Ponlponl123",
  description: "Pona! is a useful discord application and free to use.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const mobileCheck = isMobile(userAgent)
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontPonlponl123Article.variable,
        fontSNsanafonMaruJ30.variable,
        "font-sans",
        jetbrainsMono.variable
      )}
    >
      <body>
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
        <ThemeProvider>
          <Providers isMobile={mobileCheck}>
            {/* <Header /> */}
            <main id="app">{children}</main>
            {/* <Footer /> */}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}

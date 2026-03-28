import localFont from "next/font/local"
import { Geist, JetBrains_Mono } from "next/font/google"
import { cookies, headers } from "next/headers"
import { Suspense } from "react"

import "@/styles/globals.css"
import { Metadata } from "next"
import { Providers } from "./providers"
import { cn, isMobile } from "@/lib/utils"
import NextTopLoader from "nextjs-toploader"
import Header from "@/components/root/header"
import Footer from "@/components/root/footer"
import { isValidLanguageKey } from "@/lib/i18n"
import { ThemeProvider } from "@/components/theme-provider"
import LanguageSelectorModal from "@/components/modal/language-selector"
import { themeScript } from "@/hooks/theme"

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

async function AppContent({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const cookieStore = await cookies()

  const userAgent = headersList.get("user-agent") || ""
  const mobileCheck = isMobile(userAgent)

  const rawLang = cookieStore.get("lang")?.value || "en-US"
  const langCookie = isValidLanguageKey(rawLang) ? rawLang : "en-US"

  return (
    <Providers isMobile={mobileCheck} initialLang={langCookie}>
      <Header />
      <main id="app" className="min-h-screen">
        {children}
      </main>
      <Footer />
      <LanguageSelectorModal />
    </Providers>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
          <Suspense
            fallback={
              <div className="flex min-h-screen animate-pulse items-center justify-center text-muted-foreground">
                App is initializing...
              </div>
            }
          >
            <AppContent>{children}</AppContent>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}

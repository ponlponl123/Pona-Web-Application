import localFont from "next/font/local"
import { Geist, JetBrains_Mono, Figtree, Mona_Sans, Noto_Sans_Thai_Looped, Pridi } from "next/font/google"
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
import { NextThemeProvider } from "@/components/theme-provider"
import LanguageSelectorModal from "@/components/modal/language-selector"
import { fontScript, isAmoledScript, themeScript } from "@/hooks/theme"

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
const fontFigtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
})
const fontMona = Mona_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mona",
  display: "swap",
})
const fontNotoSansThai = Noto_Sans_Thai_Looped({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
  display: "swap",
})
const fontPridi = Pridi({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-pridi",
  display: "swap",
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
      <main id="app" className="min-h-dvh">
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
        "antialiased scrollbar-gutter-stable little-font",
        fontSans.variable,
        fontPonlponl123Article.variable,
        fontSNsanafonMaruJ30.variable,
        fontFigtree.variable,
        fontMona.variable,
        fontNotoSansThai.variable,
        fontPridi.variable,
        "font-sans",
        jetbrainsMono.variable
      )}
      data-font="friendly"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: isAmoledScript }} />
        <script dangerouslySetInnerHTML={{ __html: fontScript }} />
      </head>
      <body>
        <NextTopLoader
          color="var(--primary)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 24px var(--primary),0 0 12px var(--primary)"
        />
        <NextThemeProvider>
          <Suspense
            fallback={
              <div className="flex min-h-dvh animate-pulse items-center justify-center text-muted-foreground">
                App is initializing...
              </div>
            }
          >
            <AppContent>{children}</AppContent>
          </Suspense>
        </NextThemeProvider>
      </body>
    </html>
  )
}

import localFont from 'next/font/local';
import { Geist, JetBrains_Mono } from "next/font/google"

import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const fontPonlponl123Article = localFont({
  src: '../fonts/Ponlponl123_Article-Regular.woff',
  variable: '--font-ponlponl123-article',
  weight: '100 900',
});
const fontSNsanafonMaruJ30 = localFont({
  src: '../fonts/SNsanafonMaruJ30.ttf',
  variable: '--font-sn-sanafon-maru-j30',
  weight: '100 900',
});

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontPonlponl123Article.variable, fontSNsanafonMaruJ30.variable, "font-sans", jetbrainsMono.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

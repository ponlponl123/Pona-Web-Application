import React from "react"
import { Metadata } from "next"
import handshake from "@/lib/server-side-api/handshake"
import App_notOk from "./app_notOk"
import Providers from "./providers"
import { cookies } from "next/headers"
import TermsAsking from "./terms_asking"

export const metadata: Metadata = {
  title: "Pona! Application",
  description: "Pona! is a useful discord application and free to use.",
}

interface LayoutProps {
  children: React.ReactNode
  modal?: React.ReactNode
}

async function Layout(props: LayoutProps) {
  const app_isOk = await handshake()
  const cookieStore = await cookies()
  const isTermsAccepted = cookieStore.get("TERMS_ACCEPTED")

  return (
    <main>
      {isTermsAccepted?.value === "1" ? (
        app_isOk ? (
          <Providers>{props.children}</Providers>
        ) : (
          // <App_notReady />
          <App_notOk />
        )
      ) : (
        <TermsAsking />
      )}
      {props.modal}
      <div id="modal-root" />
    </main>
  )
}

export default Layout

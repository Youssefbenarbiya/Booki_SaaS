/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "next-themes"
import Header from "@/components/header/header"
import { CurrencyProvider } from "@/lib/contexts/CurrencyContext"
import { NextIntlClientProvider } from "next-intl"
import { Locale, routing } from "@/i18n/routing"
import { notFound } from "next/navigation"


async function getMessages(locale: string) {
  try {
    return (await import(`../../translations/${locale}.json`)).default
  } catch (error) {
    notFound()
  }
}

export const metadata: Metadata = {
  title: "Booki",
  description: "make reservations",
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    return notFound()
  }
  const messages = await getMessages(locale)

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {" "}
          <NextIntlClientProvider locale={locale} messages={messages}>
            <CurrencyProvider>
              <Header locale={locale} />

              {children}

              <Toaster />
            </CurrencyProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

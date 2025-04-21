import React from "react"
import { auth } from "@/auth"
import { headers } from "next/headers"
import BookCarForm from "./BookCarForm"
import SignInRedirectMessage from "@/app/[locale]/(auth)/sign-in/SignInRedirectMessage"

interface BookingPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id: carId, locale } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return (
      <SignInRedirectMessage
        callbackUrl={`/${locale}/sign-in?callbackUrl=/${locale}/cars/${carId}/booking`}
      />
    )
  }

  return <BookCarForm carId={carId} session={session} locale={locale} />
}

import React from "react"
import { auth } from "@/auth"
import { headers } from "next/headers"
import SignInRedirectMessage from "@/app/(auth)/sign-in/SignInRedirectMessage"
import BookCarForm from "./BookCarForm"

interface BookingPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id: carId } = await params

 const session = await auth.api.getSession({
   headers: await headers(),
 })

  if (!session || !session.user) {
    return (
      <SignInRedirectMessage
        callbackUrl={`/sign-in?callbackUrl=/cars/${carId}/booking`}
      />
    )
  }

  return <BookCarForm carId={carId} session={session} />
}

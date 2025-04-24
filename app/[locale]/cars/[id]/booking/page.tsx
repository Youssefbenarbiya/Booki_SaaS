import React from "react";
import { auth } from "@/auth";
import { headers } from "next/headers";
import BookCarForm from "./BookCarForm";
import SignInRedirectMessage from "@/app/[locale]/(auth)/sign-in/SignInRedirectMessage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BookingPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id: carId, locale } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return (
      <SignInRedirectMessage
        callbackUrl={`/${locale}/sign-in?callbackUrl=/${locale}/cars/${carId}/booking`}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}/cars/${carId}`}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Car Details
        </Link>
      </div>
      <BookCarForm carId={carId} session={session} locale={locale} />
    </div>
  );
}

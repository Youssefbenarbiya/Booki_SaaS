"use client"

import { useSearchParams } from "next/navigation"
import VerifyOffersContent from "./VerifyOffersContent"

export default function VerifyOffersPageWrapper() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status") || "pending"

  return <VerifyOffersContent status={status} />
}

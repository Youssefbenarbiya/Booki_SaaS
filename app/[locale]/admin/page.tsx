import { redirect } from "next/navigation"

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return redirect(`/${locale}/admin`)
}

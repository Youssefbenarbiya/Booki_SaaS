import { redirect } from "next/navigation"

export default function AdminPage({ params }: { params: { locale: string } }) {
  return redirect(`/${params.locale}/admin/dashboard`)
}

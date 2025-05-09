import { WithdrawalRequestsTable } from "@/components/dashboard/admin/withdrawal-requests-table"

export default async function WithdrawalRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Withdrawal Requests Management
      </h1>
      <WithdrawalRequestsTable locale={locale} />
    </div>
  )
}

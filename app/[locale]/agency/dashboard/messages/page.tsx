/* eslint-disable @typescript-eslint/no-unused-vars */
import { redirect } from "next/navigation"
import ChatManager from "@/components/chat/ChatManager"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { getAgencyConversations } from "@/actions/agency/messages"

export default async function AgencyMessagesPage({
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Await params immediately:
  const { locale } = await params
  // Get session from server
  const session = await auth.api.getSession({ headers: await headers() })

  // Check if user is authenticated and is an agency
  if (!session?.user || session.user.role !== "agency owner") {
    redirect(
      `/${locale}/login?callbackUrl=/${locale}/agency/dashboard/messages`
    )
  }

  // Fetch conversations for this agency
  const agencyId = session.user.id
  const result = await getAgencyConversations(agencyId)

  if (result.success) {
    console.log(
      `Found ${
        result.conversations?.length || 0
      } conversations for agency ${agencyId}`
    )

    return (
      <div className="container mx-auto pt-0 pb-8 px-4">
        <div className="space-y-2">
          <div className="bg-white rounded-lg shadow p-4 max-h-[80vh] overflow-y-auto">
            <ChatManager
              initialConversations={result.conversations?.map((conv) => ({
                ...conv,
                postType: conv.postType as "trip" | "hotel" | "room" | "car",
              }))}
            />
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="container mx-auto pt-0 pb-8 px-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-500">
            Manage conversations with customers interested in your listings
          </p>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              Error loading conversations. Please try again later.
            </div>
          </div>
        </div>
      </div>
    )
  }
}

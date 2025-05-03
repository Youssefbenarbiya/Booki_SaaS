import { redirect } from "next/navigation"
import ChatManager from "@/components/chat/ChatManager"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { getAgencyConversations } from "@/actions/agency/messages"

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  // await the promise-wrapped params
  const { locale } = await params

  // pull your session
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || session.user.role !== "agency owner") {
    // if not an agency owner, bounce back to login
    redirect(
      `/${locale}/login?callbackUrl=/${locale}/agency/dashboard/messages`
    )
  }

  // fetch the conversations
  const agencyId = session.user.id
  const result = await getAgencyConversations(agencyId)

  if (!result.success) {
    // render a friendly error UI
    return (
      <div className="container mx-auto pt-0 pb-8 px-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-gray-500">
          Manage conversations with customers interested in your listings
        </p>
        <div className="bg-red-50 text-red-600 rounded-lg p-4 mt-4">
          Error loading conversations. Please try again later.
        </div>
      </div>
    )
  }

  // otherwise hand off to your ChatManager
  return (
    <ChatManager
      initialConversations={result.conversations!.map((conv) => ({
        ...conv,
        postType: conv.postType as "trip" | "hotel" | "room" | "car",
      }))}
    />
  )
}

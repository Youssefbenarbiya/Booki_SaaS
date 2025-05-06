import { redirect } from "next/navigation"
import ChatManager from "@/components/chat/ChatManager"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { getAgencyConversations } from "@/actions/agency/messages"
import Link from "next/link"

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
        <div className="mt-4">
          <Link href="/agency/dashboard/messages/debug" className="text-blue-600 hover:underline">
            Go to Message Debug Tool →
          </Link>
        </div>
      </div>
    )
  }

  // Make sure we have conversations array
  const conversations = result.conversations || []

  // otherwise hand off to your ChatManager
  return (
    <>
      <div className="container mx-auto pt-0 pb-4 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Link href="/agency/dashboard/messages/debug" className="text-sm text-blue-600 hover:underline">
            Debug Tool
          </Link>
        </div>
      </div>
      <ChatManager
        initialConversations={conversations.map((conv) => ({
          ...conv,
          postType: conv.postType as "trip" | "hotel" | "room" | "car",
        }))}
      />
    </>
  )
}

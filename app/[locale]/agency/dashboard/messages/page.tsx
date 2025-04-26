import { redirect } from "next/navigation"
import ChatManager from "@/components/chat/ChatManager"
import { auth } from "@/auth"
import { headers } from "next/headers"

export default async function AgencyMessagesPage({
  params,
}: {
  params: { locale: string }
}) {
  // Get session from server
  const session = await auth.api.getSession({ headers: await headers() })

  // Check if user is authenticated and is an agency
  if (!session?.user || session.user.role !== "agency owner") {
    redirect(`/${params.locale}/login?callbackUrl=/${params.locale}/agency/dashboard/messages`)
  }

  // In a real implementation, you would fetch the agency's conversations here
  // and pass them as initialConversations to the ChatManager

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-gray-500">
          Manage conversations with customers interested in your listings
        </p>
        
        <div className="bg-white rounded-lg shadow p-4">
          <ChatManager initialConversations={[]} />
        </div>
      </div>
    </div>
  )
}

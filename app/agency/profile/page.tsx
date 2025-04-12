import { getAgencyProfile } from "@/actions/agency/agencyActions"
import { Metadata } from "next"
import AgencyProfileForm from "./ProfileForm"

export const metadata: Metadata = {
  title: "Agency Profile",
  description: "View and edit your agency profile details",
}

export default async function AgencyProfilePage() {
  // Fetch agency data
  const { agency } = await getAgencyProfile()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Agency Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <AgencyProfileForm initialData={agency} />
      </div>
    </div>
  )
} 
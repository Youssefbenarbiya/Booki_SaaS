import { getAgencyProfile } from "@/actions/agency/agencyActions"
import { Metadata } from "next"
import AgencyProfileForm from "./ProfileForm"

export const metadata: Metadata = {
  title: "Agency Profile",
  description: "View and edit your agency profile details",
}

export default async function AgencyProfilePage() {
  const { agency } = await getAgencyProfile()

  return (
    <div className="container py-10">
      <div className="bg-white rounded-lg shadow p-6">
        <AgencyProfileForm initialData={agency} />
      </div>
    </div>
  )
} 
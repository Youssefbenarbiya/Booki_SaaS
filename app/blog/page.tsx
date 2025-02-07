import { Metadata } from "next"

export const metadata: Metadata = {
  title: `Blog`,
}

export default async function BlogPage() {
  return (
    <div>
      <p>Blog page</p>
    </div>
  )
}

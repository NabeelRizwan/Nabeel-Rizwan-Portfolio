import { notFound } from "next/navigation"
import { IntroPreview } from "@/components/intro/preview"

export default function IntroPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound()

  return <IntroPreview />
}

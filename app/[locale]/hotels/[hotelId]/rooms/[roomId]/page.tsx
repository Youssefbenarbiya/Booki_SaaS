// Add imports for ChatButton
import dynamic from "next/dynamic";

// Import ContactButton with dynamic to avoid hydration errors
const ContactButton = dynamic(
  () => import("@/components/chat/ContactButton"),
  { ssr: false }
); 
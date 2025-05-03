"use server"

import { translateText } from "@/lib/translation/translate"

export async function translateContent(
  content: string | Record<string, string>,
  targetLang: string = "en"
) {
  if (targetLang === "en") return content

  if (typeof content === "string") {
    return await translateText(content, "en", targetLang)
  }

  const translated: Record<string, string> = {}
  for (const [key, value] of Object.entries(content)) {
    translated[key] = await translateText(value, "en", targetLang)
  }
  return translated
}

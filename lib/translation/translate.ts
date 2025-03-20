export type SupportedLanguage = "en" | "es" | "fr" | "de" | "it"

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
}

async function translateText(
  text: string,
  source: string = "en",
  target: string
) {
  try {
    const response = await fetch("http://localhost:5000/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: "text",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Translation failed")
    }

    const data = await response.json()
    return data.translatedText
  } catch (error) {
    console.error("Translation error:", error)
    return text // Fallback to original text
  }
}

export { translateText }

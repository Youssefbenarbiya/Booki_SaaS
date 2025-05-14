import { getRequestConfig } from "next-intl/server";
import { Locale, routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  try {
    // Try to load the translations for the selected locale
    const messages = (await import(`@/translations/${locale}.json`)).default;

    // Make sure the required "terms" section exists, otherwise use English as fallback
    if (!messages.terms) {
      const defaultMessages = (await import(`@/translations/en.json`)).default;
      messages.terms = defaultMessages.terms;
    }

    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // Fallback to English translations in case of an error
    return {
      locale,
      messages: (await import(`@/translations/en.json`)).default,
    };
  }
});

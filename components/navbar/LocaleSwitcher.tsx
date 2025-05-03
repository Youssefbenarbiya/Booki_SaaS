import { routing } from "@/i18n/routing"
import { useLocale } from "next-intl"
import LocaleSwitcherSelect from "./LocaleSwitcherSelect"

export default function LocaleSwitcher() {
  const locale = useLocale()

  return (
    <div className="flex items-center gap-2">
      <LocaleSwitcherSelect defaultValue={locale} label="Select a locale">
        {routing.locales.map((cur) => (
          <option key={cur} value={cur}>
            {cur}
          </option>
        ))}
      </LocaleSwitcherSelect>
    </div>
  )
}

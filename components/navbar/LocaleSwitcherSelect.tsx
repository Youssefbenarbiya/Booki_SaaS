"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Locale, routing, usePathname, useRouter } from "@/i18n/routing"
import { useParams } from "next/navigation"
import { ReactNode } from "react"
import Image from "next/image"

type Props = {
  children: ReactNode
  defaultValue: string
  label: string
}

export default function LocaleSwitcherSelect({ defaultValue, label }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  function onSelectChange(nextLocale: string) {
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      { pathname, params },
      { locale: nextLocale as Locale }
    )
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={onSelectChange}>
      <SelectTrigger
        className="w-[120px] h-8 border-none bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden"
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            <span className="flex items-center gap-2">
              <Image
                src={`/assets/icons/${locale}-flag.svg`}
                alt={`${locale} flag`}
                width={20}
                height={20}
                className="w-5 h-5"
              />
              {locale.toUpperCase()}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SUPPORTED_LANGUAGES } from '@/lib/translation/translate';

export default function LanguageSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', e.target.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
      defaultValue={searchParams.get('lang') || 'en'}
      onChange={handleLanguageChange}
    >
      {Object.entries(SUPPORTED_LANGUAGES).map(([code]) => (
        <option key={code} value={code} className="text-black">
          {code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}

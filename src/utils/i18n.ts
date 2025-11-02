'use client';
import thTH from '@/langs/th.json';
import enUS from '@/langs/en.json';
import jaJP from '@/langs/jp.json';

export type languageKeys = 'th-TH' | 'en-US' | 'ja-JP';

export interface Language {
  key: languageKeys;
  label: string;
  country: string;
  data: typeof enUS;
}

export const langs: Language[] = [
  { key: 'th-TH', label: 'ไทย', country: 'th', data: thTH },
  { key: 'en-US', label: 'English', country: 'us', data: enUS },
  { key: 'ja-JP', label: '日本語', country: 'jp', data: jaJP },
];

export default function lang(languageKey: languageKeys): Language {
  let lang;

  switch (languageKey) {
    case 'ja-JP':
      lang = jaJP;
      break;
    case 'th-TH':
      lang = thTH;
      break;
    default:
      lang = enUS;
      break;
  }

  return {
    key: lang.key as languageKeys,
    label: lang.label,
    country: lang.country,
    data: lang,
  };
}

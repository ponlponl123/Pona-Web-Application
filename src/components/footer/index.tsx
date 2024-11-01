"use client"
import React, { ChangeEvent } from 'react'
import { GithubLogo, Atom, Bird, Cube, Gavel } from "@phosphor-icons/react/dist/ssr";
import { useLanguageContext } from '@/contexts/languageContext';
import { Select, SelectItem, Avatar } from "@nextui-org/react";
import { langs, languageKeys } from '@/utils/i18n';
import Link from 'next/link';

function Footer() {
  const { language, setLanguage } = useLanguageContext();
  return (
    <footer>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/ponlponl123/Pona-Discord-Application"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GithubLogo
          alt="Github icon"
        />
        {language.data.footer.links.github}
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/ponlponl123/Pona-Discord-Application/tree/main/docs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Atom
          alt="Atom"
        />
        {language.data.footer.links.apidocs}
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://ponlponl123.com/discord"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Bird
          alt="Bird"
        />
        {language.data.footer.links.support}
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="/status"
        rel="noopener noreferrer"
      >
        <Cube
          alt="Cube"
        />
        {language.data.footer.links.status}
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://law.ponlponl123.com/pona"
        rel="noopener noreferrer"
      >
        <Gavel
          alt="Gavel"
        />
        {language.data.footer.links.legal}
      </Link>
      <Select
        className="w-32 absolute right-6"
        size='sm'
        label={language.data.footer.settings.lang.label}
        selectedKeys={[language.key]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          setLanguage(event.target.value as languageKeys);
        }}
      >
        {
          langs.map((lang) => {
            return (
              <SelectItem
                key={lang.key}
                startContent={<Avatar alt={lang.key} className="w-4 h-4" src={`https://flagcdn.com/${lang.country}.svg`} />}
              >{lang.label}</SelectItem>
            )
          })
        }
      </Select>
    </footer>
  )
}

export default Footer
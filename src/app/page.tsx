"use client";
import MyButton from '@/components/button';
import { Leaf, Cookie } from "@phosphor-icons/react/dist/ssr";
import { useLanguageContext } from '@/contexts/languageContext';
import { Select, SelectItem } from "@nextui-org/react";
import { minds } from '@/data/minds';
import Link from "next/link";

export default function Home() {
  const { language } = useLanguageContext();
  const date = new Date();
  const hours = date.getHours();
  return (
    <main className="w-full min-h-screen main-bg">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="w-full max-w-screen-lg flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className='bg-white bg-opacity-30 rounded-2xl flex flex-col gap-2 p-4 max-sm:p-3 backdrop-blur-sm max-sm:text-sm max-sm:absolute max-sm:bottom-24'>
            <h1 className='flex gap-3 items-center text-xl mb-0 max-sm:text-lg'>
              <Cookie
                alt="Next.js logo"
                weight='regular'
                className='max-sm:h-6 max-sm:w-6'
                size={32}
              />
              {language.data.cookie.title}
            </h1>
            <p>{language.data.cookie.description}</p>
          </div>
          <h1 className='text-5xl whitespace-pre' style={{lineHeight: "78px"}}>{
            (hours > 4 && hours < 10) ? language.data.home.welcome_message.morning :
            (hours > 9 && hours < 16) ? language.data.home.welcome_message.morning :
            (hours > 15 && hours < 20) ? language.data.home.welcome_message.morning :
            language.data.home.welcome_message.night
          }</h1>
          <ol className="list-inside text-sm text-center sm:text-left list-none -mt-6 mb-2">
            <li className="mb-2 text-xl">{language.data.home.mindselector.title}</li>
            <li>
              <div>
                <Select
                  className="max-w-xs"
                  disabledKeys={["sweet"]}
                  size='sm'
                  label={language.data.home.mindselector.label}
                >
                  {
                    minds.map((mind) => (
                      <SelectItem
                        key={mind.key}
                        startContent={mind.startContent}
                      >{language.data.mind[mind.key as keyof typeof language.data.mind]}</SelectItem>
                    ))
                  }
                </Select>
              </div>
            </li>
          </ol>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link
              href="/invite"
              rel="noopener noreferrer"
            >
              <MyButton variant="primary" effect='confetti'>
                <Leaf
                  weight="fill"
                  alt="Leaf"
                />
                {language.data.home.actions.invite}
              </MyButton>
            </Link>
            <Link
              href="/app"
              rel="noopener noreferrer"
            >
              <MyButton variant="invert" style='rounded' size="medium">
                {language.data.home.actions.app}
              </MyButton>
            </Link>
          </div>
        </main>
      </div>
    </main>
  );
}

"use client";
import MyButton from '@/components/button';
import { ClockCountdown, Confetti, Cookie } from "@phosphor-icons/react/dist/ssr";
import { useLanguageContext } from '@/contexts/languageContext';
import { Select, SelectItem } from "@nextui-org/react";
import { minds } from '@/data/minds';
import Link from "next/link";

import confetti from 'canvas-confetti';
import CountdownTimer from '@/components/timer';

export default function Home() {
  const { language } = useLanguageContext();
  const date = new Date();
  const hours = date.getHours();

  const newYearIn = new Date(date.getFullYear()+1, 0, 1).getTime() - date.getTime();

  return (
    <main className="w-full min-h-screen main-bg">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="w-full max-w-screen-lg flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className='bg-white bg-opacity-30 max-miniscreen:hidden rounded-2xl flex flex-col gap-2 p-4 max-sm:p-3 backdrop-blur-sm max-sm:text-sm max-sm:absolute max-sm:bottom-24'>
            <h1 className='flex gap-3 items-center text-xl mb-0 max-sm:text-lg'>
              <Cookie
                alt="Cookie!"
                weight='regular'
                className='max-sm:h-6 max-sm:w-6'
                size={32}
              />
              {language.data.cookie.title}
            </h1>
            <p>{language.data.cookie.description}</p>
          </div>
          <h1 className='text-5xl leading-relaxed max-md:text-4xl  max-sm:text-center max-sm:text-3xl max-miniscreen:text-2xl max-sm:leading-10'>{
            (hours > 4 && hours < 10) ? language.data.home.welcome_message.morning :
            (hours > 9 && hours < 16) ? language.data.home.welcome_message.afternoon :
            (hours > 15 && hours < 20) ? language.data.home.welcome_message.evening :
            language.data.home.welcome_message.night
          }</h1>
          <ol className="list-inside text-sm text-center sm:text-left list-none -mt-6 mb-2">
            <li className="mb-2 text-xl max-md:text-lg max-miniscreen:text-base">{language.data.home.mindselector.title}</li>
            <li>
              <div>
                <Select
                  className="max-w-xs max-miniscreen:scale-75"
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
              <MyButton variant="primary" effect='confetti' className='btn-responsive'>
                <Confetti
                  weight="fill"
                  alt="Confetti"
                />
                {language.data.home.actions.invite}
              </MyButton>
            </Link>
            <Link
              href="/app"
              rel="noopener noreferrer"
            >
              <MyButton variant="invert" style='rounded' size="medium" className='btn-responsive'>
                {language.data.home.actions.app}
              </MyButton>
            </Link>
          </div>
        </main>
        {
          (newYearIn/1000) < (24 * 60 * 60) &&
          (
            <div id='newYearTimer' className='flex gap-2 items-center justify-center z-40 fixed bottom-4 left-1/2 -translate-x-1/2 p-3 bg-white bg-opacity-60 border-white border-2 rounded-full max-sm:hidden backdrop-blur-sm'>
              <ClockCountdown size={18} />
              <p className='text-sm font-bold max-sm:text-xxs'>Happy New Year in <CountdownTimer timeLeft={Math.floor(newYearIn/1000)} onEnd={() => {
                const duration = 15 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
                document.getElementById('newYearTimer')?.classList.add('opacity-0');
                document.getElementById('newYearTimer')?.classList.add('bottom-0');
                document.getElementById('newYearTimer')?.classList.add('pointer-events-none');
                
                function randomInRange(min: number, max: number) {
                  return Math.random() * (max - min) + min;
                }
                
                const interval = setInterval(function() {
                  const timeLeft = animationEnd - Date.now();
                
                  if (timeLeft <= 0) {
                    return clearInterval(interval);
                  }
                
                  const particleCount = 50 * (timeLeft / duration);
                  confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                  confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);
              }} /></p>
            </div>
          )
        }
      </div>
    </main>
  );
}

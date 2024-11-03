'use client'
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { useDiscordUserInfo } from '@/contexts/discordUserInfo'
import {Card, CardHeader, CardBody, Image} from '@nextui-org/react'

import release010 from '@/../public/app/updates/release010.png'
import release013 from '@/../public/app/updates/release013.png'
import release014 from '@/../public/app/updates/release014.png'
import Link from 'next/link'

const updates = [
  {
    title: 'Pre-Release 0.1.4',
    description: 'New features, bug fixes, and performance improvements',
    date: 'Nov 3, 2024',
    releaseLink: 'https://github.com/ponlponl123/Pona-Discord-Application/releases/tag/pre-release/0.1.4',
    image: release014.src
  },
  {
    title: 'Pre-Release 0.1.3',
    description: 'New features, bug fixes, and performance improvements',
    date: 'Nov 2, 2024',
    releaseLink: 'https://github.com/ponlponl123/Pona-Discord-Application/releases/tag/pre-release/0.1.3',
    image: release013.src
  },
  {
    title: 'Pre-Release 0.1.0',
    description: 'New features, bug fixes, and performance improvements',
    date: 'Oct 30, 2024',
    releaseLink: 'https://github.com/ponlponl123/Pona-Discord-Application/releases/tag/pre-release/0.1.0',
    image: release010.src
  },
]

function Page() {
  const { language } = useLanguageContext();
  const { userInfo } = useDiscordUserInfo();
  const date = new Date();
  const hours = date.getHours();
  const isNow = (hours > 4 && hours < 10) ? 'morning' :
                (hours > 9 && hours < 16) ? 'afternoon' :
                (hours > 9 && hours < 20) ? 'evening' :
                'night'
  return (
    <main id="app-panel">
      <div className='min-h-36 max-h-96 h-screen w-full absolute'>
        <div className={`absolute w-full min-h-36 h-screen top-0 left-0 apphome-banner ${isNow}`} style={{maxHeight: '512px'}}></div>
      </div>
      <main id="app-workspace" className='relative z-10'>
        <h1 className='text-2xl mb-4 mt-64'>{language.data.app.home.name}</h1>
        <h1 className='text-5xl'>👋 {language.data.app.home.title.replace('[user]', (userInfo?.global_name as string))}</h1>
        <div className='mt-16'></div>
        <h1 className='text-4xl'>Get started!</h1>
        <div className='flex flex-wrap gap-6 p-4 mt-4'>
          {
            updates.map((update, index) => {
              return (
                <Link key={index} href={update.releaseLink} target='_blank'>
                  <Card className="py-4" isPressable>
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                      <p className="text-tiny uppercase font-bold">Updates</p>
                      <small className="text-default-500">{update.date}</small>
                      <h4 className="font-bold text-large">{update.title}</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                      <Image
                        alt="Card background"
                        className="object-cover rounded-xl"
                        src={update.image}
                        width={270}
                      />
                    </CardBody>
                  </Card>
                </Link>
              )
            })
          }
        </div>
      </main>
    </main>
  )
}

export default Page
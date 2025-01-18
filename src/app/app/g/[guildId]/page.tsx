"use client"
import React from 'react'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import defaultBanner from '@/../public/app/default.png';
import { Alert, Chip, Spinner, Tooltip, Image as NextUIimage } from '@nextui-org/react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, BarChart, Legend, Bar, PieChart, Pie } from 'recharts';
import { useLanguageContext } from '@/contexts/languageContext';

const data = [
  {
    "date": "00:00",
    "queue": 1
  },
  {
    "date": "03:00",
    "queue": 3
  },
  {
    "date": "06:00",
    "queue": 0
  },
  {
    "date": "09:00",
    "queue": 14
  },
  {
    "date": "12:00",
    "queue": 9
  },
  {
    "date": "15:00",
    "queue": 12
  },
  {
    "date": "18:00",
    "queue": 3
  },
  {
    "date": "21:00",
    "queue": 0
  }
]

function Page() {
  const { language } = useLanguageContext();
  const { guild } = useDiscordGuildInfo();

  return (
    <main id='app-panel'>
      <main id='app-workspace'>
        {
          guild ? (
            <>
              <h1 className='text-base'>{guild.id}</h1>
              <h1 className='text-3xl mb-4'>{guild.name}</h1>
              <div className='guild-profile flex flex-col'>
                <div className='bg-foreground-50 w-full h-48 rounded-3xl max-md:overflow-hidden max-md:h-32'>
                  {
                    guild.bannerURL ? (
                      <>
                        <NextUIimage isBlurred alt={guild.name as string} src={guild.bannerURL+'?size=480'} width={"100%"} height={192}
                          className='w-full h-full object-cover'
                        />
                      </>
                    ) : (
                      <>
                        <div className='w-full h-full overflow-hidden rounded-3xl'>
                          <NextUIimage alt={guild.name as string} src={guild.iconURL+'?size=320' || defaultBanner.src as string} width={"100%"} height={192}
                            className='w-full h-full object-cover blur-2xl'
                          />
                        </div>
                      </>
                    )
                  }
                </div>
                <div className='flex px-12 -mt-12 z-10'>
                  <div className='overflow-hidden rounded-full outline outline-4' style={{outlineColor: 'var(--app-background)'}}>
                    <NextUIimage alt={guild.name as string} src={guild.iconURL+'?size=128' || defaultBanner.src as string} width={96} height={96}
                      className='w-24 h-24 object-cover'
                    />
                  </div>
                </div>
              </div>
              <section className='p-8 flex flex-col gap-4'>
                <h1 className='text-3xl'>{language.data.app.guilds.stats.title} <Chip color="warning" variant="bordered">{language.data.extensions.experiment}</Chip></h1>
                <Alert className='mb-4' radius='full' color='primary' variant='flat' title={language.data.app.guilds.stats.announcement} />
                <div className='flex max-lg:flex-wrap gap-6 w-full'>
                  <div className='w-full h-fit'>
                    <h1 className='text-2xl mb-4 px-8'>{language.data.app.guilds.stats.queue}</h1>
                    <ResponsiveContainer width={'100%'} height={256}>
                      <AreaChart data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="queue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Area type="step" dataKey="queue" stroke="#8884d8" fillOpacity={1} fill="url(#queue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='w-full h-fit'>
                    <h1 className='text-2xl mb-4 px-8'>{language.data.app.guilds.stats.members}</h1>
                    <ResponsiveContainer width={'100%'} height={256}>
                      <AreaChart data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="queue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Area type="step" dataKey="queue" stroke="#8884d8" fillOpacity={1} fill="url(#queue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className='flex max-lg:flex-wrap gap-6 w-full'>
                  <div className='w-full h-fit'>
                    <h1 className='text-2xl mb-4 px-8'>{language.data.app.guilds.stats.usage}</h1>
                    <ResponsiveContainer width={'100%'} height={256}>
                      <BarChart width={730} height={250} data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="queue" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='w-full h-fit'>
                    <h1 className='text-2xl mb-4 px-8'>{language.data.app.guilds.stats.analysis}</h1>
                    <ResponsiveContainer width={'100%'} height={256}>
                      <PieChart width={730} height={250}>
                        <Pie data={data} dataKey="queue" nameKey="date" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <Spinner/>
            </>
          )
        }
      </main>
    </main>
  )
}

export default Page
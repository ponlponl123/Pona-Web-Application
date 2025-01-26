"use client"
import React from 'react'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import defaultBanner from '@/../public/app/default.png';
import { Spinner, Image as NextUIimage, Chip, Avatar } from '@nextui-org/react';
import { CartesianGrid, XAxis, YAxis, ResponsiveContainer, BarChart, Legend, Bar, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Line, LineChart } from 'recharts';
import { useLanguageContext } from '@/contexts/languageContext';
import { default_data, default_member_data, data, data01, data02 } from '@/data/guild/stats';

import guild_stats from '@/server-side-api/guild/stats';
import { getRandomColor } from '@/components/status/managerChart';
import { getCookie } from 'cookies-next';

interface ActiveUsageChart {
  date: string;
  played?: number;
}

type channelId = {
  [key: string]: number;
}

interface MemberInChannel {
  date: string;
  channels: channelId;
}

function Page() {
  const { language } = useLanguageContext();
  const { guild } = useDiscordGuildInfo();

  const [activeStats, setActiveStats] = React.useState<ActiveUsageChart[] | null>(null);
  const [memberInChannel, setMemberInChannel] = React.useState<MemberInChannel[] | null>(null);

  const token = getCookie('LOGIN_') as string | undefined;
  const tokenType = getCookie('LOGIN_TYPE_') as string | undefined;

  React.useEffect(() => {
    if (token && tokenType && guild && guild.id) {
      async function fetchActiveStats(token: string, tokenType: string, guildId: string) {
        const res = await guild_stats({token: token, type: tokenType}, guildId);
        if (!res) {
          // console.error('No response from guild_stats API');
          return;
        }
        const data = JSON.parse(res) as { active: ActiveUsageChart[]; members: MemberInChannel[] };
  
        // Aggregate member data by date and ensure unique channels
        const aggregatedMembers = data.members.map((entry) => {
          const consolidatedChannels: { [key: string]: number } = {};
  
          Object.entries(entry.channels).forEach(([channel, count]) => {
            if (consolidatedChannels[channel]) {
              consolidatedChannels[channel] += count;
            } else {
              consolidatedChannels[channel] = count;
            }
          });
  
          return { ...entry, channels: consolidatedChannels };
        });
    
        setActiveStats(data.active);
        setMemberInChannel(aggregatedMembers);
      }
      fetchActiveStats(token, tokenType, guild.id);
    }
  }, [guild, token, tokenType]);  

  const channelColors = React.useMemo(() => {
    const colors: { [key: string]: string } = {};
    if (memberInChannel) {
      memberInChannel.forEach((data) => {
        Object.keys(data.channels).forEach((channel) => {
          if (!colors[channel]) {
            colors[channel] = getRandomColor(channel);
          }
        });
      });
    }
    return colors;
  }, [memberInChannel]);

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
                      <NextUIimage isBlurred alt={guild.name as string} src={guild.bannerURL+'?size=480'} width={"100%"} height={192}
                        className='w-full h-full object-cover bg-primary'
                      />
                    ) : (
                      <div className='w-full h-full overflow-hidden rounded-3xl'>
                        <NextUIimage alt={guild.name as string} src={guild.iconURL+'?size=320' || defaultBanner.src as string} width={"100%"} height={192}
                          className='w-full h-full object-cover blur-2xl bg-primary'
                        />
                      </div>
                    )
                  }
                </div>
                <div className='flex px-12 -mt-12 z-10'>
                  <div className='overflow-hidden rounded-full outline outline-4 outline-playground-background'>
                    <Avatar
                      alt={`${guild && guild.name} Avatar`}
                      src={guild.iconURL+'?size=128' || defaultBanner.src as string}
                      name={guild ? guild.name : 'Guild'}
                      className='w-24 h-24 object-cover bg-primary'
                    />
                  </div>
                </div>
              </div>
              <section className='p-8 flex flex-col gap-4'>
                <h1 className='text-3xl flex gap-3 items-center'>{language.data.app.guilds.stats.title} <Chip color='secondary' size='sm'>{language.data.app.guilds.stats.in.replace("[day]", "7")}</Chip></h1>
                <div className='flex max-lg:flex-wrap gap-6 w-full'>
                  <div className='w-full h-fit bg-primary-100/20 py-4 rounded-3xl'>
                    <h1 className='text-2xl mb-4 px-8'>{language.data.app.guilds.stats.analysis}</h1>
                    <ResponsiveContainer width={'100%'} height={256} className="px-4">
                      <BarChart width={730} height={250} data={activeStats ? activeStats : default_data as ActiveUsageChart[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <Tooltip contentStyle={{backgroundColor:'hsl(var(--pona-app-background))',borderRadius:'16px',border:'none',padding:'1em 1.4em'}} />
                        <Bar dataKey="played" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='w-full h-fit bg-primary-100/20 py-4 rounded-3xl'>
                    <h1 className='text-2xl mb-4 px-8'>{language.data.app.guilds.stats.members}</h1>
                    <ResponsiveContainer width={'100%'} height={256}>
                      <LineChart
                        data={memberInChannel ? memberInChannel : default_member_data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--pona-app-background))', borderRadius: '16px', border: 'none', padding: '1em 1.4em' }} />
                        {memberInChannel &&
                          Object.keys(channelColors).map((channel) => (
                            <Line
                              key={channel}
                              type="monotone"
                              dataKey={(data: MemberInChannel) => data.channels[channel] || 0}
                              name={channel}
                              stroke={channelColors[channel]}
                              fillOpacity={1}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className='relative bg-primary-100/40 rounded-3xl pt-4'>
                  <h1 className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-2xl'>{language.data.extensions.comingsoon}!</h1>
                  <div className='flex max-lg:flex-wrap gap-6 w-full -z-10 blur-sm pointer-events-none'>
                    <div className='w-full h-fit px-8'>
                      <h1 className='text-2xl mb-4'>{language.data.app.guilds.stats.genre}</h1>
                      <ResponsiveContainer width={'100%'} height={256} className="px-4">
                        <RadarChart outerRadius={90} width={730} height={250} data={data}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} />
                          <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Radar name="Lily" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className='w-full h-fit px-8'>
                      <h1 className='text-2xl mb-4'>{language.data.app.guilds.stats.top_artist}</h1>
                      <ResponsiveContainer width={'100%'} height={256} className="px-4">
                        <PieChart width={730} height={250}>
                          <Pie data={data01} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" />
                          <Pie data={data02} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d" label />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <Spinner/>
          )
        }
      </main>
    </main>
  )
}

export default Page
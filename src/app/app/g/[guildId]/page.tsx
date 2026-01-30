'use client';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import {
  data,
  data01,
  data02,
  default_data,
  default_member_data,
} from '@/data/guild/stats';
import {
  Avatar,
  Chip,
  Image,
  Image as NextUIimage,
  Spinner,
} from '@heroui/react';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getRandomColor } from '@/components/status/managerChart';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useUserSettingContext } from '@/contexts/userSettingContext';
import guild_stats from '@/server-side-api/guild/stats';
import { getCookie } from 'cookies-next';

interface ActiveUsageChart {
  date: string;
  played?: number;
}

type channelId = {
  [key: string]: number;
};

interface MemberInChannel {
  date: string;
  channels: channelId;
}

function Page() {
  const { language } = useLanguageContext();
  const { guild } = useDiscordGuildInfo();
  const { userSetting } = useUserSettingContext();
  const { userInfo } = useDiscordUserInfo();

  const [activeStats, setActiveStats] = React.useState<
    ActiveUsageChart[] | null
  >(null);
  const [memberInChannel, setMemberInChannel] = React.useState<
    MemberInChannel[] | null
  >(null);

  const token = getCookie('LOGIN_') as string | undefined;
  const tokenType = getCookie('LOGIN_TYPE_') as string | undefined;
  const backdropBg = guild?.bannerURL
    ? guild?.bannerURL + '?size=640'
    : guild?.iconURL
      ? guild?.iconURL + '?size=640'
      : userInfo?.banner
        ? `https://cdn.discordapp.com/banners/${userInfo?.id}/${userInfo?.banner}?size=640`
        : userInfo?.avatar
          ? `https://cdn.discordapp.com/avatars/${userInfo?.id}/${userInfo?.avatar}?size=640`
          : '/static/backdrop.png';

  React.useEffect(() => {
    if (token && tokenType && guild && guild.id) {
      async function fetchActiveStats(
        token: string,
        tokenType: string,
        guildId: string
      ) {
        const res = await guild_stats(
          { token: token, type: tokenType },
          guildId
        );
        if (!res) {
          // console.error('No response from guild_stats API');
          return;
        }
        const data = JSON.parse(res) as {
          active: ActiveUsageChart[];
          members: MemberInChannel[];
        };

        // Aggregate member data by date and ensure unique channels
        const aggregatedMembers = data.members.map(entry => {
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
      memberInChannel.forEach(data => {
        Object.keys(data.channels).forEach(channel => {
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
      <div className='absolute w-full h-max max-h-[48vh] min-h-48 top-0 left-0 z-1 opacity-40 pointer-events-none scale-[2]'>
        {userSetting.transparency ? (
          <Image
            src={`/api/proxy/image?r=${encodeURIComponent(backdropBg || '/static/backdrop.png')}&s=512&blur=16&saturation=96&contrast=12`}
            alt={guild?.name || ''}
            width={'100%'}
            height={undefined}
            classNames={{
              wrapper: 'w-full h-full absolute top-0 left-0',
            }}
            className='object-cover w-full h-full max-h-[48vh] pointer-events-none saturate-200 brightness-110 -translate-y-1'
          />
        ) : (
          <div className='w-full h-96 bg-linear-to-t from-transparent to-[hsl(var(--pona-app-music-accent-color-500))]' />
        )}
        <div className='absolute top-[unset] bottom-0 left-0 w-full h-2/4 bg-linear-to-b from-transparent to-playground-background z-10' />
      </div>
      <main id='app-workspace' className='relative z-10'>
        {guild ? (
          <>
            <h1 className='text-base'>{guild.id}</h1>
            <h1 className='text-3xl mb-4'>{guild.name}</h1>
            <div className='guild-profile flex flex-col'>
              <div className='bg-foreground-50 w-full h-48 rounded-3xl max-md:overflow-hidden max-md:h-32'>
                {guild.bannerURL ? (
                  <NextUIimage
                    isBlurred
                    alt={guild.name as string}
                    src={guild.bannerURL + '?size=480'}
                    width={'100%'}
                    height={192}
                    className='w-full h-full object-cover bg-primary'
                  />
                ) : (
                  <div className='w-full h-full overflow-hidden rounded-3xl'>
                    <NextUIimage
                      alt={guild.name as string}
                      src={
                        guild.iconURL + '?size=320' || '/static/app/default.png'
                      }
                      width={'100%'}
                      height={192}
                      className='w-full h-full object-cover blur-2xl bg-primary'
                    />
                  </div>
                )}
              </div>
              <div className='flex px-12 -mt-12 z-10'>
                <div className='overflow-hidden rounded-full outline-4 outline-playground-background'>
                  <Avatar
                    alt={`${guild && guild.name} Avatar`}
                    src={
                      guild.iconURL + '?size=128' || '/static/app/default.png'
                    }
                    name={guild ? guild.name : 'Guild'}
                    className='w-24 h-24 object-cover bg-primary'
                  />
                </div>
              </div>
            </div>
            <section className='p-8 flex flex-col gap-4'>
              <h1 className='text-3xl flex gap-3 items-center'>
                {language.data.app.guilds.stats.title}{' '}
                <Chip className='text-base' color='secondary' size='sm'>
                  {language.data.app.guilds.stats.in.replace('[day]', '7')}
                </Chip>
              </h1>
              <div className='flex max-lg:flex-wrap gap-6 w-full'>
                <div className='w-full h-fit bg-primary-100/20 backdrop-blur-sm backdrop-saturate-200 py-4 rounded-3xl'>
                  <h1 className='text-2xl mb-4 px-6 pt-2'>
                    {language.data.app.guilds.stats.analysis}
                  </h1>
                  <ResponsiveContainer
                    width={'100%'}
                    height={256}
                    className='px-4'
                  >
                    <BarChart
                      width={730}
                      height={250}
                      data={
                        activeStats
                          ? activeStats
                          : (default_data as ActiveUsageChart[])
                      }
                    >
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--pona-app-background))',
                          borderRadius: '16px',
                          border: 'none',
                          padding: '1em 1.4em',
                        }}
                      />
                      <Bar dataKey='played' fill='#8884d8' />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className='w-full h-fit bg-primary-100/20 backdrop-blur-sm backdrop-saturate-200 py-4 rounded-3xl'>
                  <h1 className='text-2xl mb-4 px-6 pt-2'>
                    {language.data.app.guilds.stats.members}
                  </h1>
                  <ResponsiveContainer width={'100%'} height={256}>
                    <LineChart
                      data={
                        memberInChannel ? memberInChannel : default_member_data
                      }
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <XAxis dataKey='date' />
                      <YAxis />
                      <CartesianGrid strokeDasharray='3 3' />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--pona-app-background))',
                          borderRadius: '16px',
                          border: 'none',
                          padding: '1em 1.4em',
                        }}
                      />
                      {memberInChannel &&
                        Object.keys(channelColors).map(channel => (
                          <Line
                            key={channel}
                            type='monotone'
                            dataKey={(data: MemberInChannel) =>
                              data.channels[channel] || 0
                            }
                            name={channel}
                            stroke={channelColors[channel]}
                            fillOpacity={1}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className='relative bg-primary-100/40 backdrop-blur-sm backdrop-saturate-200 rounded-3xl pt-4'>
                <h1 className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-2xl'>
                  {language.data.extensions.comingsoon}!
                </h1>
                <div className='flex max-lg:flex-wrap gap-6 w-full -z-10 blur-sm pointer-events-none'>
                  <div className='w-full h-fit px-8'>
                    <h1 className='text-2xl mb-4'>
                      {language.data.app.guilds.stats.genre}
                    </h1>
                    <ResponsiveContainer
                      width={'100%'}
                      height={256}
                      className='px-4'
                    >
                      <RadarChart
                        outerRadius={90}
                        width={730}
                        height={250}
                        data={data}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey='subject' />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} />
                        <Radar
                          name='Mike'
                          dataKey='A'
                          stroke='#8884d8'
                          fill='#8884d8'
                          fillOpacity={0.6}
                        />
                        <Radar
                          name='Lily'
                          dataKey='B'
                          stroke='#82ca9d'
                          fill='#82ca9d'
                          fillOpacity={0.6}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='w-full h-fit px-8'>
                    <h1 className='text-2xl mb-4'>
                      {language.data.app.guilds.stats.top_artist}
                    </h1>
                    <ResponsiveContainer
                      width={'100%'}
                      height={256}
                      className='px-4'
                    >
                      <PieChart width={730} height={250}>
                        <Pie
                          data={data01}
                          dataKey='value'
                          nameKey='name'
                          cx='50%'
                          cy='50%'
                          outerRadius={50}
                          fill='#8884d8'
                        />
                        <Pie
                          data={data02}
                          dataKey='value'
                          nameKey='name'
                          cx='50%'
                          cy='50%'
                          innerRadius={60}
                          outerRadius={80}
                          fill='#82ca9d'
                          label
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <Spinner />
        )}
      </main>
    </main>
  );
}

export default Page;

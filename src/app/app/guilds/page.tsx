'use client';
import MyButton from '@/components/button';
import { GuildButton } from '@/components/guild/button';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import { fetchGuilds, GuildInfo } from '@/server-side-api/discord/fetchGuild';
import { ConfettiIcon, GhostIcon } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';
import { ClimbingBoxLoader } from 'react-spinners';

function Page() {
  const { setCurrentGuild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
  const [guilds, setGuilds] = React.useState<GuildInfo[] | false | null>(null);
  const token = getCookie('LOGIN_');
  const tokenType = getCookie('LOGIN_TYPE_');

  React.useEffect(() => {
    async function fetchGuildsFromClient() {
      const resolvedToken = typeof token === 'string' ? token : String(token);
      const resolvedTokenType =
        typeof tokenType === 'string' ? tokenType : String(tokenType);
      if (!resolvedToken || !resolvedTokenType) return setGuilds(false);
      const res = await fetchGuilds(resolvedToken, resolvedTokenType);
      setGuilds(res);
    }
    fetchGuildsFromClient();
  }, [token, tokenType]);

  return (
    <main id='app-panel'>
      <main id='app-workspace' className='flex flex-col'>
        <h1 className='text-2xl mb-4'>{language.data.app.guilds.name}</h1>
        <h1 className='text-5xl flex items-center gap-4'>
          <ConfettiIcon weight='fill' />
          {language.data.app.guilds.title}
        </h1>
        <section className='w-full min-h-full mt-12 flex flex-col gap-4'>
          {guilds === null ? (
            <div className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'>
              <ClimbingBoxLoader
                cssOverride={{
                  borderColor: 'var(--heroui-color-current) !important',
                  color: 'var(--heroui-color-current) !important',
                }}
                color='currentColor'
                size={16}
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  repeatDelay: 1,
                  ease: 'linear',
                }}
              >
                {language.data.app.guilds.loading}
              </motion.span>
            </div>
          ) : (guilds as GuildInfo[]).length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.48 }}
              className='flex flex-col gap-4'
            >
              {(guilds as GuildInfo[]).map((guild, index) => {
                const uri = `/app/g/${guild.id}`;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 1, delay: 0.1 * index }}
                    key={guild.id}
                  >
                    <GuildButton
                      guild={guild}
                      uri={uri}
                      setCurrentGuild={setCurrentGuild}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'
            >
              <GhostIcon size={48} />
              <h1 className='text-3xl'>
                {language.data.app.guilds.not_found.title}
              </h1>
              <span>{language.data.app.guilds.not_found.description}</span>
              <div className='flex mt-3'>
                <Link href='/invite' rel='noopener noreferrer'>
                  <MyButton size='small' variant='primary' effect='confetti'>
                    <ConfettiIcon weight='fill' />
                    {language.data.header.actions.invite}
                  </MyButton>
                </Link>
              </div>
            </motion.div>
          )}
        </section>
      </main>
    </main>
  );
}

export default Page;

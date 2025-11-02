'use client';
import { usePathname } from 'next/navigation';
import {
  BasicGuildInfo,
  fetchBasicGuildInfo,
} from '@/server-side-api/discord/fetchGuild';
import { useContext, createContext, useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';

const discordGuildInfo = createContext<{
  guild: BasicGuildInfo | undefined;
  setCurrentGuild: (guild: BasicGuildInfo) => void;
}>({
  guild: undefined,
  setCurrentGuild: () => {},
});

export const DiscordGuildInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [guild, setGuild] = useState<BasicGuildInfo | undefined>(undefined);
  const pathname = usePathname() || '';

  useEffect(() => {
    const currentAccessToken = getCookie('LOGIN_');
    const currentAccessTokenType = getCookie('LOGIN_TYPE_');
    if (pathname.startsWith('/app/g/')) {
      const guildId = pathname.split('/')[3];
      fetchBasicGuildInfo(
        String(currentAccessToken),
        String(currentAccessTokenType),
        guildId
      )
        .then(value => {
          if (!value) return window.location.replace('/app/guilds');
          setGuild(value);
        })
        .catch(console.error);
    } else setGuild(undefined);
  }, [pathname]);

  const setCurrentGuild = (guild: BasicGuildInfo | undefined) => {
    setGuild(guild);
  };

  return (
    <discordGuildInfo.Provider value={{ guild, setCurrentGuild }}>
      {children}
    </discordGuildInfo.Provider>
  );
};

export const useDiscordGuildInfo = () => useContext(discordGuildInfo);

export default discordGuildInfo;

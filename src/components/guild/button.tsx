'use client';
import React from 'react';
import { CaretRight } from '@phosphor-icons/react/dist/ssr';
import { Spinner, Avatar, Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { GuildInfo } from '@/server-side-api/discord/fetchGuild';

export function GuildButton({
  guild,
  uri,
  setCurrentGuild,
}: {
  guild: GuildInfo;
  uri: string;
  setCurrentGuild: (guild: GuildInfo) => void;
}) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const onClick = () => {
    setLoading(true);
    router.push(uri);
    setCurrentGuild(guild);
  };
  return (
    <Button
      onClick={onClick}
      href={uri}
      className='w-full py-12 group bg-foreground/10'
      style={{ borderRadius: '32px' }}
    >
      <div className='w-full p-2 flex items-center justify-center gap-3 max-h-none'>
        <div className='flex flex-col items-center justify-center h-16 w-16 relative'>
          <Avatar
            src={guild.iconURL as string}
            className={`${loading ? 'h-12 w-12' : 'h-16 w-16'}`}
          />
          <Spinner
            color='primary'
            size='lg'
            classNames={{ base: 'w-14 h-14', wrapper: 'w-14 h-14' }}
            className={`absolute ${!loading ? 'hidden' : ''}`}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl leading-8'>{guild.name}</h1>
          <span className='text-base text-start'>{guild.id}</span>
        </div>
        <div className='m-auto mr-4'>
          <CaretRight
            className='group-hover:translate-x-1 group-active:-translate-x-1'
            size={18}
          />
        </div>
      </div>
    </Button>
  );
}

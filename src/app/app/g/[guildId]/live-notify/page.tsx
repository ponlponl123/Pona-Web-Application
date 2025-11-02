'use client';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import { Alert, Chip, Spinner } from '@nextui-org/react';
import { Broadcast } from '@phosphor-icons/react/dist/ssr';
import React from 'react';

function Page() {
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
  const [loading] = React.useState<boolean>(true);
  const [guildSettings, setGuildSettings] = React.useState({});

  React.useEffect(() => {}, [setGuildSettings]);

  return (
    <main id='app-panel'>
      <main id='app-workspace'>
        {guild ? (
          <>
            <h1 className='text-base'>{guild.name}</h1>
            <h1 className='text-5xl mt-4 flex items-center gap-4'>
              <Broadcast weight='fill' size={48} />{' '}
              {language.data.app.guilds.live_notify.name}{' '}
              <Chip size='sm'>{language.data.extensions.beta}</Chip>
            </h1>
            {!loading ? (
              guildSettings ? (
                <></>
              ) : (
                <Alert color='danger'>Cannot fetch guild setting :(</Alert>
              )
            ) : (
              <div
                className='w-full max-w-screen-lg mt-16 gap-4 flex flex-col items-center justify-center text-center'
                style={{ minHeight: '48vh' }}
              >
                <Spinner />
              </div>
            )}
          </>
        ) : (
          <>
            <Spinner />
          </>
        )}
      </main>
    </main>
  );
}

export default Page;

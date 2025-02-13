import React from 'react'
import ActivationLink from '../scrollbar/activationLink'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { ClockCounterClockwise, Compass, HouseSimple } from '@phosphor-icons/react/dist/ssr';
import { useLanguageContext } from '@/contexts/languageContext';

function PlayerNav() {
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
  return (
    <div className='w-full h-16 fixed bottom-0 left-0 bg-playground-background/90 backdrop-blur-md border-t-[2px] border-foreground/10 flex flex-row items-center justify-around z-10'>
      <ActivationLink className='w-full h-full rounded-none !bg-transparent' iconSize={20} iconOnly={true} href={`/app/g/${guild?.id}/player`} icon={HouseSimple}>{language.data.app.guilds.player.home.title}</ActivationLink>
      <ActivationLink className='w-full h-full rounded-none !bg-transparent' iconSize={20} iconOnly={true} href={`/app/g/${guild?.id}/player/browse`} icon={Compass}>{language.data.app.guilds.player.browse.title}</ActivationLink>
      <ActivationLink className='w-full h-full rounded-none !bg-transparent' iconSize={20} iconOnly={true} href={`/app/g/${guild?.id}/player/history`} icon={ClockCounterClockwise}>{language.data.app.guilds.player.history.title}</ActivationLink>
    </div>
  )
}

export default PlayerNav
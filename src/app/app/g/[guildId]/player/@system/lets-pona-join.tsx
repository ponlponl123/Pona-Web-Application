'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { VoiceBasedChannel } from 'discord.js';
import {
  IslandIcon,
  SpeakerHighIcon,
  SignInIcon,
  RadioIcon,
  CaretRightIcon,
} from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import { isMemberInVCAtom } from '@/store/uiAtoms';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { PartyPopper } from '@/components/animate-ui/icons/party-popper';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import clsx from 'clsx';

interface VoiceChannelUserItem {
  id?: string;
  avatar?: string | null;
  username?: string;
  globalName?: string;
  global_name?: string;
}

interface VoiceChannelMemberItem {
  id?: string;
  avatar?: string | null;
  nickname?: string;
  displayName?: string;
  globalName?: string;
  global_name?: string;
  username?: string;
  user?: VoiceChannelUserItem;
}

function JoinVoiceChannelButton({
  voiceChannel,
}: {
  voiceChannel: VoiceBasedChannel;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const { guild } = useDiscordGuildInfo();
  const { userInfo } = useDiscordUserInfo();
  const { socket } = useSocket();
  const setIsMemberInVC = useSetAtom(isMemberInVCAtom);

  const membersList = React.useMemo(() => {
    const rawMembers = (voiceChannel as unknown as { members?: VoiceChannelMemberItem[] | Record<string, VoiceChannelMemberItem> | { values?: () => Iterable<VoiceChannelMemberItem> } })?.members;
    let items: VoiceChannelMemberItem[] = [];

    if (Array.isArray(rawMembers)) {
      items = rawMembers;
    } else if (rawMembers && typeof rawMembers === 'object') {
      if ('values' in rawMembers && typeof (rawMembers as { values?: () => Iterable<VoiceChannelMemberItem> }).values === 'function') {
        items = Array.from((rawMembers as { values: () => Iterable<VoiceChannelMemberItem> }).values());
      } else {
        items = Object.values(rawMembers as Record<string, VoiceChannelMemberItem>);
      }
    }

    const userItems = items
      .map((m: VoiceChannelMemberItem) => {
        const u = m?.user || m;
        return {
          id: u?.id || m?.id,
          avatar: u?.avatar || m?.avatar || null,
          name:
            u?.globalName ||
            u?.global_name ||
            u?.username ||
            m?.nickname ||
            m?.displayName ||
            'User',
          avatarUrl:
            u?.id && (u?.avatar || m?.avatar)
              ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar || m.avatar
              }.png?size=64`
              : null,
        };
      })
      .filter((u) => Boolean(u.id));

    if (userInfo?.id && !userItems.some((u) => u.id === userInfo.id)) {
      userItems.unshift({
        id: userInfo.id,
        avatar: userInfo.avatar,
        name: userInfo.global_name || userInfo.username || 'User',
        avatarUrl: userInfo.avatar
          ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=64`
          : null,
      });
    }

    return userItems;
  }, [voiceChannel, userInfo]);

  return (
    <Button
      className='w-full h-auto justify-between bg-primary/10 hover:bg-primary/20 text-foreground border-2 border-transparent hover:border-primary/40 relative p-2 rounded-xl transition-all duration-200 group overflow-hidden shadow-sm'
      variant='ghost'
      disabled={loading}
      onClick={() => {
        setLoading(true);
        setIsMemberInVC(voiceChannel);
        socket?.emit('join', guild?.id, voiceChannel.id);
      }}
    >
      <div className='flex items-center gap-3 w-full text-left'>
        <div className='size-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
          <AnimateIcon animate>
            <AudioLines />
          </AnimateIcon>
        </div>
        <div className='flex flex-col gap-1 min-w-0 flex-1'>
          <h2 className='text-base font-semibold truncate text-foreground leading-tight'>
            {voiceChannel.name}
          </h2>
          <div className='flex items-center gap-2'>
            {membersList.length > 0 ? (
              <AvatarGroup>
                {membersList.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className={"size-4 ring-0!"}>
                    {member.avatarUrl ? (
                      <AvatarImage src={member.avatarUrl} alt={member.name} className={clsx(member.id === userInfo?.id ? "border-2 border-success" : "border-0")} />
                    ) : null}
                    <AvatarFallback className='text-[10px] font-semibold'>
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {membersList.length > 4 && (
                  <AvatarGroupCount>
                    +{membersList.length - 4}
                  </AvatarGroupCount>
                )}
              </AvatarGroup>
            ) : null}
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          {voiceChannel.userLimit ? (
            <span className='text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25'>
              Limit {voiceChannel.userLimit}
            </span>
          ) : null}
          <CaretRightIcon className='size-3 text-primary' weight='bold' />
        </div>
      </div>
    </Button>
  );
}

export default function LetsPonaJoin() {
  const language = useAppStore((state) => state.language);
  const isMemberInVC = useAtomValue(isMemberInVCAtom);

  return (
    <motion.div
      className='absolute w-full h-full top-0 left-0 flex flex-col gap-4 items-center justify-center bg-background/30 z-10 backdrop-blur-xl p-4 select-none'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48 }}
    >
      <motion.div
        className='relative bg-card/40 border border-primary/20 backdrop-blur-2xl rounded-3xl p-8 overflow-hidden w-full max-w-sm flex flex-col gap-6 items-center justify-center shadow-2xl text-center'
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.48, type: 'spring', bounce: 0.2 }}
      >
        <AnimateIcon animate>
          <PartyPopper className='size-12' />
        </AnimateIcon>

        <div className='flex flex-col gap-1.5'>
          <h1 className='text-2xl font-extrabold tracking-tight text-foreground'>
            {language.data.app.guilds.player.ponaIsNotInVC.select.title}
          </h1>
          <p className='text-xs text-muted-foreground leading-relaxed px-2'>
            {language.data.app.guilds.player.ponaIsNotInVC.select.description}
          </p>
        </div>

        <div className='w-full max-h-72 px-1 py-1 overflow-y-auto scrollbar-hide'>
          {isMemberInVC ? (
            <JoinVoiceChannelButton voiceChannel={isMemberInVC} />
          ) : (
            <div className='flex flex-col gap-3 items-center justify-center py-6 px-4 text-center rounded-2xl bg-muted/20 border border-border/40'>
              <div className='size-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground'>
                <IslandIcon size={28} weight='duotone' />
              </div>
              <div className='flex flex-col gap-1'>
                <h2 className='text-base font-semibold text-foreground/80'>
                  {
                    language.data.app.guilds.player.ponaIsNotInVC.select.notfound
                      .title
                  }
                </h2>
                <p className='text-xs text-muted-foreground leading-normal'>
                  {
                    language.data.app.guilds.player.ponaIsNotInVC.select.notfound
                      .description
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}



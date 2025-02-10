"use client"
import React from 'react'
import { Image, Spinner } from '@nextui-org/react';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import MusicCard from '@/components/music/card';
import { Track } from '@/interfaces/ponaPlayer';
import { GuildMember } from 'discord.js';

const sample_track: Track = {
  "uri": "https://www.youtube.com/watch?v=YuO2p4mOXX0",
  "isrc": "",
  "title": "私のこと好きでしょ？ / covered by ぬふちゃ 瀬戸わらび",
  "track": "QAAA+gMASOengeOBruOBk+OBqOWlveOBjeOBp+OBl+OCh++8nyAvIGNvdmVyZWQgYnkg44Gs44G144Gh44KDIOeArOaIuOOCj+OCieOBswAV44Gs44G144Gh44KD44KT44Gt44KLAAAAAAAC4kgAC1l1TzJwNG1PWFgwAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9WXVPMnA0bU9YWDABAD9odHRwczovL2kueXRpbWcuY29tL3ZpL1l1TzJwNG1PWFgwL21heHJlc2RlZmF1bHQuanBnP3Y9NjY2NzE1YjEAAAd5b3V0dWJlAAAAAAAAAAA=",
  "cleanTitle": "私のこと好きでしょ？",
  "author": "ぬふちゃんねる",
  cleanAuthor: "ぬふちゃんねる",
  "duration": 189000,
  "isStream": false,
  "uniqueId": "3K2i80I0WzwZ3n7t927adCzW7WNXVhcy",
  "requester": {
    "id": "604950275966631936",
    "bot": false,
    "tag": "_ponlponl123",
    "avatar": "772bac166295072d7e8620ff0959bf29",
    "system": false,
    "username": "_ponlponl123",
    "avatarURL": "https://cdn.discordapp.com/avatars/604950275966631936/772bac166295072d7e8620ff0959bf29.webp",
    "globalName": "Arona",
    "discriminator": "0",
    "avatarDecoration": null,
    "createdTimestamp": 1564301785223,
    "defaultAvatarURL": "https://cdn.discordapp.com/embed/avatars/5.png",
    "displayAvatarURL": "https://cdn.discordapp.com/avatars/604950275966631936/772bac166295072d7e8620ff0959bf29.webp",
    "avatarDecorationData": null
  } as unknown as GuildMember,
  "thumbnail": "https://img.youtube.com/vi/YuO2p4mOXX0/default.jpg",
  "timestamp": 1737987673770,
  "artworkUrl": "https://i.ytimg.com/vi/YuO2p4mOXX0/maxresdefault.jpg?v=666715b1",
  "identifier": "YuO2p4mOXX0",
  "isSeekable": true,
  "sourceName": "youtube"
}

function Page() {
  const { userInfo } = useDiscordUserInfo();
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
  return (
    guild ? (
      <>
        <div className='w-full max-w-screen-lg mt-16 gap-4 flex flex-col items-center justify-center text-center'>
          <div className='w-full flex gap-5'>
            <Image src={userInfo ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=64` : ''} alt={userInfo ? userInfo.global_name : 'User'} height={64}
              className='rounded-full' />
            <div className='flex flex-col items-start justify-center'>
              <h3 className='text-lg leading-none'>{userInfo?.global_name}</h3>
              <h1 className='text-5xl'>{language.data.app.guilds.player.home.listen_again}</h1>
            </div>
          </div>
          <div className='w-full my-6 flex flex-row items-start justify-start gap-5'>
            <MusicCard track={sample_track} />
          </div>
        </div>
      </>
    ) : (
      <>
        <Spinner />
      </>
    )
  )
}

export default Page
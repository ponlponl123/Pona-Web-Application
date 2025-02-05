import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useLanguageContext } from '@/contexts/languageContext'
import { numberToHexColor } from '@/utils/colorUtils';
import { Avatar, Chip, Image, Link } from '@nextui-org/react';
import { DiscordLogo, StarAndCrescent } from '@phosphor-icons/react/dist/ssr';
import React from 'react'

function Account() {
  const { language } = useLanguageContext();
  const { userInfo } = useDiscordUserInfo();
  return (
    <section className='w-full min-h-full my-6 flex flex-col gap-6 pb-12' id='account' data-section>
      <h1 className='text-5xl flex items-center gap-4 pt-4'><StarAndCrescent weight='fill' />{userInfo ? userInfo.global_name : language.data.app.setting.account.title}</h1>
      <div>
        <div className='rounded-3xl'>
          <Image
            isBlurred
            alt={`${userInfo && userInfo.global_name} Banner`}
            src={userInfo ? `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}.png?size=1024` : ''}
            className='object-cover object-center bg-primary'
            width="100%"
          />
        </div>
        <div className='flex gap-6 z-10 relative px-12 max-md:px-6'>
          <div className='flex flex-col items-center max-md:absolute max-md:left-12'>
            <div className='-translate-y-1/2 outline outline-8 outline-playground-background rounded-full block overflow-hidden min-w-32 w-32 h-32 max-md:outline-4 max-md:min-w-24 max-md:w-24 max-md:h-24'>
              <Avatar
                alt={`${userInfo && userInfo.global_name} Avatar`}
                src={userInfo ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=128` : ''}
                name={userInfo ? userInfo.username : 'Me'}
                className='object-cover object-center max-md:w-24 max-md:h-24 bg-primary w-32 h-32'
              />
            </div>
            <div className='flex gap-4 -mt-12 z-10 max-md:hidden'>
              {
                userInfo ?
                  userInfo.accent_color ? <div className='w-5 h-5 rounded-full outline outline-2 outline-foreground-100 outline-offset-2' style={{ backgroundColor: numberToHexColor(userInfo.accent_color) }}></div>
                  : userInfo.banner_color && <div className='w-5 h-5 rounded-full outline outline-2 outline-foreground-100 outline-offset-2' style={{ backgroundColor: userInfo.banner_color }}></div>
                : <></>
              }
            </div>
          </div>
          <div className='bg-foreground-100/25 w-full p-8 max-md:pt-12 rounded-3xl md:rounded-ss-lg mt-4 flex flex-col gap-4'>
            <Chip color="primary" className='md:-mt-4 md:-ml-4 md:-mb-1 max-md:-mt-10 max-md:ml-24 max-md:-mb-2' size='sm' startContent={<DiscordLogo className='ml-2 mr-1' weight='fill' />}>{language.data.app.setting.account.announcement}</Chip>
            <div className='flex flex-col'>
              <label className='block text-sm font-medium text-foreground-600'>{language.data.app.setting.account.display_name}</label>
              <span className='text-xl'>{userInfo && userInfo.global_name}</span>
            </div>
            <div className='flex flex-col'>
              <label className='block text-sm font-medium text-foreground-600'>{language.data.app.setting.account.username}</label>
              <span className='text-xl'>@{userInfo && userInfo.username}</span>
            </div>
            <div className='flex flex-wrap gap-2 -mb-3'>
              <Link isBlock showAnchorIcon color="primary" size='sm' rel='noopener' target='_blank' href='https://law.ponlponl123.com/pona#terms'>Terms of Service</Link>
              <Link isBlock showAnchorIcon color="primary" size='sm' rel='noopener' target='_blank' href='https://law.ponlponl123.com/pona#privacy'>Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Account
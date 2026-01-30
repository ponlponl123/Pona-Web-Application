'use client';
import { Radio } from '@/components/radio';
import { useLanguageContext } from '@/contexts/languageContext';
import { useUserSettingContext } from '@/contexts/userSettingContext';
import { RadioGroup } from '@heroui/react';
import { MonitorPlayIcon } from '@phosphor-icons/react/dist/ssr';

function Player() {
  const { language } = useLanguageContext();
  const { userSetting, setUserSetting } = useUserSettingContext();
  return (
    <section
      className='w-full min-h-full flex flex-col gap-6'
      id='layout-player'
      data-section
    >
      <h2 className='text-3xl flex items-center gap-4 pt-4'>
        <MonitorPlayIcon weight='fill' />
        {language.data.app.setting.layout.player.title}
      </h2>
      <RadioGroup
        className='w-full'
        classNames={{
          wrapper: 'flex xl:flex-nowrap lg:flex-row gap-4',
          label: 'text-lg font-semibold mb-2',
        }}
        defaultValue={String(userSetting.dev_pona_player_style) || 'compact'}
        onValueChange={value => {
          setUserSetting({
            ...userSetting,
            dev_pona_player_style: value as 'compact' | 'modern',
          });
        }}
      >
        <Radio
          value='compact'
          classNames={{
            base: 'w-full p-3 rounded-2xl',
            control: 'hidden',
            wrapper: 'hidden',
            labelWrapper: 'w-full m-0',
            description: 'm-4 mt-0',
          }}
          description={
            language.data.app.setting.layout.player.compact.description
          }
        >
          <div>
            <div className='bg-playground-background border-2 border-foreground/20 rounded-xl p-6 mb-4'>
              <div className='w-full p-3 bg-foreground/10 rounded-xl flex items-center justify-center text-foreground/50'>
                <div className='w-12 h-12 bg-primary/80 rounded-lg mr-4' />
                <div className='flex flex-col flex-1 min-w-0'>
                  <div className='w-full flex items-center justify-between gap-1 mb-2'>
                    <div className='flex-1 min-w-0 bg-primary h-1 rounded-full' />
                    <div className='w-1/4 bg-foreground/10 h-1 rounded-full' />
                  </div>
                  <div className='w-full flex items-center justify-between'>
                    <div className='flex flex-col min-w-0 flex-1 mr-4'>
                      <span className='text-sm'>
                        {
                          language.data.app.setting.layout.player.preview
                            .component.title
                        }
                      </span>
                      <span className='text-xs opacity-40'>
                        {
                          language.data.app.setting.layout.player.preview
                            .component.artist
                        }
                      </span>
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                      <span className='text-sm'>0:00</span>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 bg-primary/80 rounded-full' />
                        <div className='w-6 h-6 bg-primary/80 rounded-full' />
                        <div className='w-3 h-3 bg-primary/80 rounded-full' />
                      </div>
                      <span className='text-sm'>3:45</span>
                    </div>
                    <div className='flex flex-row items-center justify-end gap-2 min-w-0 flex-1 ml-4'>
                      <div className='w-2 h-2 bg-primary/80 rounded-full' />
                      <div className='w-2 h-2 bg-primary/80 rounded-full' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <strong className='font-bold text-xl m-4 mb-0'>
              {language.data.app.setting.layout.player.compact.title}
            </strong>
          </div>
        </Radio>
        <Radio
          value='modern'
          classNames={{
            base: 'w-full p-3 rounded-2xl',
            control: 'hidden',
            wrapper: 'hidden',
            labelWrapper: 'w-full m-0',
            description: 'm-4 mt-0',
          }}
          description={
            language.data.app.setting.layout.player.comfortable.description
          }
        >
          <div>
            <div className='bg-playground-background border-2 border-foreground/20 rounded-xl p-6 mb-4'>
              <div className='w-full flex px-2 items-center justify-between gap-1 mb-2'>
                <div className='flex-1 min-w-0 bg-primary h-1 rounded-full' />
                <div className='w-1/4 bg-foreground/10 h-1 rounded-full' />
              </div>
              <div className='w-full p-3 bg-foreground/10 rounded-2xl flex flex-col items-center justify-center text-foreground/50'>
                <div className='w-full flex items-center justify-between'>
                  <div className='w-full flex items-center justify-between'>
                    <div className='flex min-w-0 flex-1 mr-4'>
                      <div className='w-10 h-10 bg-primary/80 rounded-lg mr-4' />
                      <div className='flex flex-col min-w-0 flex-1 mr-4'>
                        <span className='text-sm'>
                          {
                            language.data.app.setting.layout.player.preview
                              .component.title
                          }
                        </span>
                        <span className='text-xs opacity-40'>
                          {
                            language.data.app.setting.layout.player.preview
                              .component.artist
                          }
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                      <span className='text-sm'>0:00</span>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 bg-primary/80 rounded-full' />
                        <div className='w-6 h-6 bg-primary/80 rounded-full' />
                        <div className='w-3 h-3 bg-primary/80 rounded-full' />
                      </div>
                      <span className='text-sm'>3:45</span>
                    </div>
                    <div className='flex flex-row items-center justify-end gap-2 min-w-0 flex-1 ml-4'>
                      <div className='w-2 h-2 bg-primary/80 rounded-full' />
                      <div className='w-2 h-2 bg-primary/80 rounded-full' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <strong className='font-bold text-xl m-4 mb-0'>
              {language.data.app.setting.layout.player.comfortable.title}
            </strong>
          </div>
        </Radio>
      </RadioGroup>
    </section>
  );
}

export default Player;

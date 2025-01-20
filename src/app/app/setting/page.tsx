"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { Bug, DiscordLogo, Info, Keyboard, MoonStars, PaintBrush, Palette, StarAndCrescent, SunHorizon, Tree } from '@phosphor-icons/react/dist/ssr'
import Switch from '@/components/switch'
import { Chip, Image, Link, RadioGroup } from '@nextui-org/react'
import { DynamicTheme, ThemeDot, ThemePreview, themes, ThemeUpdate, useThemeContext } from '@/contexts/themeContext';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { numberToHexColor } from '@/utils/colorUtils';
import { Radio } from '@/components/radio';

function Page() {
    const { language } = useLanguageContext();
    const { theme } = useThemeContext();
    const { userInfo } = useDiscordUserInfo();
    const [currentTheme, setCurrentTheme] = React.useState<DynamicTheme>(theme);
    return (
      <main id="app-panel">
          <main id="app-workspace" className='flex flex-col pb-[56vh]'>
              <h1 className='text-2xl mb-4'>{language.data.app.setting.name}</h1>
              <section className='w-full min-h-full my-6 flex flex-col gap-6 pb-12' id='account' data-section>
                <h1 className='text-5xl flex items-center gap-4 pt-4'><StarAndCrescent weight='fill' />{userInfo ? userInfo.global_name : language.data.app.setting.account.title}</h1>
                <div className=''>
                  <div className='max-md:h-48 max-md:overflow-hidden rounded-3xl'>
                    <Image
                      isBlurred
                      alt={`${userInfo && userInfo.global_name} Banner`}
                      src={userInfo ? `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}.png?size=1024` : ''}
                      className='object-cover object-center'
                      width="100%"
                      height={280}
                    />
                  </div>
                  <div className='flex gap-6 z-10 relative px-12 max-md:px-6'>
                    <div className='flex flex-col items-center max-md:absolute max-md:left-12'>
                      <div className='-translate-y-1/2 outline outline-8 outline-playground-background rounded-full block overflow-hidden min-w-32 w-32 h-32 max-md:outline-4 max-md:min-w-24 max-md:w-24 max-md:h-24'>
                        <Image
                          alt={`${userInfo && userInfo.global_name} Avatar`}
                          src={userInfo ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=128` : ''}
                          className='object-cover object-center max-md:w-24 max-md:h-24'
                          width={128}
                          height={128}
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
              <section className='w-full min-h-full my-6 flex flex-col gap-6 pb-12' id='layout' data-section>
                <h1 className='text-5xl flex items-center gap-4 pt-4'><Palette weight='fill' />{language.data.app.setting.layout.title}</h1>
                <div className='flex flex-col gap-4' id='layout-theme' data-section>
                  {
                    (!currentTheme.sync) ? (
                      <section className='p-6 border-3 rounded-2xl border-primary'>
                        <Chip color="primary" size="lg" variant="shadow" startContent={<PaintBrush className='mr-1' weight='fill' />}>{language.data.app.setting.layout.theme.title}</Chip>
                        <ThemePreview theme={currentTheme.single} />
                        <div className='gap-2 flex flex-wrap pt-6'>
                          {
                            themes.map((theme, index) => (
                              <ThemeDot key={index} theme={theme} active={(currentTheme.single === theme)} onClick={() => {setCurrentTheme((value)=>{const n_theme={...value,single:theme};ThemeUpdate(n_theme);return n_theme})}} />
                            ))
                          }
                        </div>
                      </section>
                    ) : (
                      <div className='w-full flex max-xl:flex-wrap gap-4'>
                        <section className='p-6 border-3 rounded-2xl border-warning w-full'>
                          <Chip color="warning" size="lg" variant="shadow" startContent={<Tree className='mr-1' weight='fill' />}>{language.data.app.setting.layout.theme.day}</Chip>
                          <ThemePreview theme={currentTheme.day} />
                          <div className='gap-2 flex flex-wrap pt-6'>
                            {
                              themes.map((theme, index) => (
                                <ThemeDot key={index} theme={theme} active={(currentTheme.day === theme)} onClick={() => {setCurrentTheme((value)=>{const n_theme={...value,day:theme};ThemeUpdate(n_theme);return n_theme})}} />
                              ))
                            }
                          </div>
                        </section>
                        <section className='p-6 border-3 rounded-2xl border-secondary w-full'>
                          <Chip color="secondary" size="lg" variant="shadow" startContent={<MoonStars className='mr-1' weight='fill' />}>{language.data.app.setting.layout.theme.night}</Chip>
                          <ThemePreview theme={currentTheme.night} />
                          <div className='gap-2 flex flex-wrap pt-6'>
                            {
                              themes.map((theme, index) => (
                                <ThemeDot key={index} theme={theme} active={(currentTheme.night === theme)} onClick={() => {setCurrentTheme((value)=>{const n_theme={...value,night:theme};ThemeUpdate(n_theme);return n_theme})}} />
                              ))
                            }
                          </div>
                        </section>
                      </div>
                    )
                  }
                  <Switch
                    name={language.data.app.setting.layout.theme_sync.title}
                    description={language.data.app.setting.layout.theme_sync.description}
                    default_value={currentTheme.sync}
                    onValueChange={(value) => {
                      setCurrentTheme((ref_value)=>{const n_theme={...ref_value,sync:value};ThemeUpdate(n_theme);return n_theme})
                    }}
                  />
                </div>
                <section className='w-full min-h-full flex flex-col gap-6' id='layout-timeformat' data-section>
                  <h2 className='text-3xl flex items-center gap-4 pt-4'><SunHorizon weight='fill' />{language.data.app.setting.layout.time_format.title}</h2>
                  <RadioGroup className='w-full' defaultValue={"auto"}>
                    <Radio description={language.data.app.setting.layout.time_format.auto.description} value="auto">
                      {language.data.app.setting.layout.time_format.auto.title}
                    </Radio>
                    <Radio description={language.data.app.setting.layout.time_format[12].description} value="12" isDisabled>
                      {language.data.app.setting.layout.time_format[12].title}
                    </Radio>
                    <Radio description={language.data.app.setting.layout.time_format[24].description} value="24" isDisabled>
                      {language.data.app.setting.layout.time_format[24].title}
                    </Radio>
                  </RadioGroup>
                </section>
              </section>
              <section className='w-full min-h-full my-6 flex flex-col gap-6 pb-12' id='keybinds' data-section>
                <h1 className='text-5xl flex items-center gap-4 pt-4'><Keyboard weight='fill' />{language.data.app.setting.keybinds.title}</h1>
                <Chip color="primary" variant='flat' size='lg' startContent={<Info weight='fill' className='ml-2 mr-1' />}>{language.data.app.setting.keybinds.announcement}</Chip>
                <div className='flex flex-col gap-4' id='keybinds-list' data-section></div>
              </section>
              <section className='w-full min-h-full my-6 flex flex-col gap-6 pb-12' id='devzone' data-section>
                <h1 className='text-5xl flex items-center gap-4 pt-4'><Bug weight='fill' />{language.data.app.setting.dev_mode.title}</h1>
                <Switch
                  name='Experimental API Routes'
                  description='Use the experimental API endpoints'
                  isDisabled
                />
              </section>
          </main>
      </main>
    )
}

export default Page
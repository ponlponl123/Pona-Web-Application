"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { Bug, MoonStars, PaintBrush, Palette, Tree } from '@phosphor-icons/react/dist/ssr'
import Switch from '@/components/switch'
import { Chip } from '@nextui-org/react'
import { DynamicTheme, ThemeDot, ThemePreview, themes, ThemeUpdate, useThemeContext } from '@/contexts/themeContext';

function Page() {
    const { language } = useLanguageContext();
    const { theme } = useThemeContext();
    const [currentTheme, setCurrentTheme] = React.useState<DynamicTheme>(theme);
    return (
      <main id="app-panel">
          <main id="app-workspace" className='flex flex-col'>
              <h1 className='text-2xl mb-4'>{language.data.app.setting.name}</h1>
              <section className='w-full min-h-full my-6 flex flex-col gap-6' id='layout' data-section>
                <h1 className='text-5xl flex items-center gap-4'><Palette weight='fill' />{language.data.app.setting.layout.title}</h1>
                {
                  (!currentTheme.sync) ? (
                    <section className='p-6 border-3 rounded-2xl border-primary'>
                      <Chip color="primary" size="lg" variant="shadow" startContent={<PaintBrush className='mr-1' weight='fill' />}>{language.data.app.setting.layout.theme.title}</Chip>
                      <ThemePreview theme={currentTheme.single} />
                      <div className='gap-2 flex pt-6'>
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
                        <div className='gap-2 flex pt-6'>
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
                        <div className='gap-2 flex pt-6'>
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
              </section>
              <section className='w-full min-h-full my-6 flex flex-col gap-6' id='devzone' data-section>
                <h1 className='text-5xl flex items-center gap-4'><Bug weight='fill' />{language.data.app.setting.dev_mode.title}</h1>
                <Switch
                  name='Experimental API Routes'
                  description='Use the experimental API endpoints'
                />
              </section>
          </main>
      </main>
    )
}

export default Page
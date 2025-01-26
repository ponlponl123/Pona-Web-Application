import { useLanguageContext } from '@/contexts/languageContext';
import { dark_amoled_themes, dark_themes, DynamicTheme, fetchThemes, ThemeDot, ThemePreview, Themes, ThemeUpdate, useThemeContext } from '@/contexts/themeContext';
import { Chip } from '@nextui-org/react';
import { MoonStars, PaintBrush, Tree } from '@phosphor-icons/react/dist/ssr';
import Switch from '@/components/switch'
import React from 'react'

function Theme() {
  const { theme } = useThemeContext();
  const { language } = useLanguageContext();
  const [currentTheme, setCurrentTheme] = React.useState<DynamicTheme>(theme);
  return (
    <div className='flex flex-col gap-4' id='layout-theme' data-section>
      {
        (!currentTheme.sync) ? (
          <section className='p-6 border-3 rounded-2xl border-primary'>
            <Chip color="primary" size="lg" variant="shadow" startContent={<PaintBrush className='mr-1' weight='fill' />}>{language.data.app.setting.layout.theme.title}</Chip>
            <ThemePreview theme={currentTheme.single} />
            <div className='gap-2 flex flex-wrap pt-6'>
              {
                fetchThemes(true, currentTheme.isAmoled).map((theme, index) => (
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
                  fetchThemes(true, currentTheme.isAmoled).map((theme, index) => (
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
                  fetchThemes(true, currentTheme.isAmoled).map((theme, index) => (
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
      {
        (
          (!currentTheme.sync && (dark_themes.includes(currentTheme.single) || dark_amoled_themes.includes(currentTheme.single))) ||
          (currentTheme.sync && (
            (dark_themes.includes(currentTheme.day) || dark_amoled_themes.includes(currentTheme.day)) ||
            (dark_themes.includes(currentTheme.night) || dark_amoled_themes.includes(currentTheme.night))
          ))
        ) &&
        (
          <>
            <Switch
              name={language.data.app.setting.layout.amoled_black.title}
              description={language.data.app.setting.layout.amoled_black.description}
              default_value={currentTheme.isAmoled}
              onValueChange={(value) => {
                setCurrentTheme((ref_value)=>{
                  const n_theme: DynamicTheme = {
                    ...ref_value,
                    isAmoled:value,
                    single: (value && !ref_value.single.startsWith('amoled-') && ref_value.single.endsWith('-dark')) ? `amoled-${ref_value.single}` as Themes : (!value && ref_value.single.startsWith('amoled-') && !ref_value.single.endsWith('-dark')) ? `${ref_value.single}` as Themes : ref_value.single,
                    day: (value && !ref_value.day.startsWith('amoled-') && ref_value.day.endsWith('-dark')) ? `amoled-${ref_value.day}` as Themes : (!value && ref_value.day.startsWith('amoled-') && ref_value.day.endsWith('-dark')) ? ref_value.day.replace('amoled-','') as Themes : ref_value.day,
                    night: (value && !ref_value.night.startsWith('amoled-') && ref_value.night.endsWith('-dark')) ? `amoled-${ref_value.night}` as Themes : (!value && ref_value.night.startsWith('amoled-') && ref_value.night.endsWith('-dark')) ? ref_value.night.replace('amoled-','') as Themes : ref_value.night
                  };
                  ThemeUpdate(n_theme);
                  return n_theme
                })
              }}
            />
          </>
        )
      }
    </div>
  )
}

export default Theme
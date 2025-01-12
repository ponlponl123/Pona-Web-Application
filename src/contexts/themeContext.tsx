"use client";
import { Tooltip } from "@nextui-org/react";
import { getCookie, setCookie } from "cookies-next";
import React, { createContext, MouseEventHandler, useContext, useEffect } from "react";

export type Themes =
  'dark' | 'light' |
  'nextui-light' | 'nextui-dark' |
  'chocolate-light' | 'chocolate-dark' |
  'latte-light' | 'latte-dark' |
  'winter-light' |
  'violet-light' |
  'cupcake-light' | 'cupcake-dark';
export interface DynamicTheme {
  sync: boolean;
  single: Themes;
  day: Themes;
  night: Themes;
}
export const themes: Themes[] = ['light', 'nextui-light', 'chocolate-light', 'latte-light', 'winter-light', 'violet-light', 'cupcake-light', 'dark', 'nextui-dark', 'chocolate-dark', 'latte-dark', 'cupcake-dark'];
export const dark_themes: typeof themes = ['dark', 'nextui-dark', 'chocolate-dark', 'chocolate-dark', 'cupcake-dark'];
export const light_themes: typeof themes = ['light', 'nextui-light', 'chocolate-light', 'latte-light', 'winter-light', 'violet-light', 'cupcake-light'];
export const defaultDynamicTheme: DynamicTheme = {sync: true, single: themes[0], day: light_themes[0], night: dark_themes[0]};

const ThemeContext = createContext<{
  theme: DynamicTheme;
  setTheme: (languageKey: DynamicTheme) => void;
}>({
  theme: defaultDynamicTheme,
  setTheme: () => {},
});

export function ThemeUpdate(theme: DynamicTheme): void {
  setCookie('theme', theme, {
    expires: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000), // expires in 90 days
  });
  const setTheme = (theme: Themes) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.value = theme;
  }
  if ( theme.sync )
  {
    const date = new Date();
    if ( date.getHours() > 6 && date.getHours() < 18 )
      setTheme(theme.day);
    else
      setTheme(theme.night);
  } else setTheme(theme.single);
}

export function ThemeContextProvider ({children}: {children: React.ReactNode}) {
  const cookieTheme = getCookie('theme');
  const getTheme: DynamicTheme = cookieTheme ? (JSON.parse(String(cookieTheme)) as DynamicTheme) : defaultDynamicTheme;
  const [theme, setThemeState] = React.useState<DynamicTheme>(getTheme);
  const setTheme = (theme: DynamicTheme) => {
    ThemeUpdate(theme);
    setThemeState(theme);
  }
  useEffect(() => {
    ThemeUpdate(theme);
  }, [theme])
  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => useContext(ThemeContext);

export default ThemeContextProvider;

export function ThemeDot({theme, active, onClick}: {theme: Themes, active?: boolean, onClick?: MouseEventHandler<HTMLButtonElement>}) {
  return (
    <Tooltip className="capitalize z-10" color="default" placement="bottom" content={theme} data-theme={theme}>
      <button onClick={onClick} title={theme} data-theme={theme} className={`theme-dot interactive ${theme} ${active ? 'active': ''}`}><div><div></div><div></div></div></button>
    </Tooltip>
  )
}

export function ThemePreview({theme}: {theme: Themes}) {
  return (
    <div className={`theme-preview ${theme}`} data-theme={theme} style={{backgroundColor:'rgb(var(--background-rgb))'}}>
      <div className="tp-header">
        <div className="tp-chip tp-chip-2-10"></div>
        <div className="tp-chip tp-chip-2-10"></div>
        <div className="tp-chip tp-chip-2-10"></div>
      </div>
      <div className="tp-body">
        <div className="flex flex-row justify-between">
          <div className="tp-chip tp-chip-3-10"></div>
          <div className="flex flex-row gap-2">
            <div className="tp-dot tp-dot-primary"></div>
            <div className="tp-dot tp-dot-success"></div>
            <div className="tp-dot tp-dot-danger"></div>
          </div>
        </div>
        <div className="tp-chip tp-chip-6-10 tp-foreground tp-sm"></div>
        <div className="flex flex-row gap-2">
          <div className="tp-chip tp-secondary tp-xs"></div>
          <div className="tp-chip tp-warning tp-xs"></div>
        </div>
        <div className="w-full h-14 flex flex-row gap-2">
          <div className="tp-chip flex rounded-lg tp-foreground" style={{width:'24%',height:'100%',borderRadius:'6px'}}></div>
          <div className="tp-chip flex rounded-lg" style={{width:'86%',height:'100%',borderRadius:'6px'}}></div>
        </div>
      </div>
      <div className="tp-footer">
        <div className="tp-chip tp-chip-2-10 tp-sm"></div>
        <div className="tp-chip tp-chip-3-10 tp-xs tp-foreground"></div>
      </div>
    </div>
  )
}
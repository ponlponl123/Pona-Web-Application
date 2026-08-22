// for ref
const _og_themeScript = () => {
  try {
    const storedAppTheme = localStorage.getItem("app-theme")
    const storedResolvedTheme = localStorage.getItem("theme")
    const storedDayTheme = localStorage.getItem("app-day-theme")
    const storedNightTheme = localStorage.getItem("app-night-theme")
    const isStoredDayThemeDark = localStorage.getItem("is-app-day-theme-dark")
    const isStoredNightThemeDark = localStorage.getItem(
      "is-app-night-theme-dark"
    )
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (storedAppTheme) {
      document.documentElement.setAttribute("data-theme", storedAppTheme)
    }

    if (storedResolvedTheme === "custom") {
      if (isDarkMode && storedNightTheme) {
        document.documentElement.setAttribute("data-theme", storedNightTheme)
        isStoredNightThemeDark === "true" &&
          document.documentElement.classList.add("dark")
      } else if (storedDayTheme) {
        document.documentElement.setAttribute("data-theme", storedDayTheme)
        isStoredDayThemeDark === "true" &&
          document.documentElement.classList.add("light")
      }
    }
  } catch (e) {
    console.error("Theme script failed", e)
  }
}

export const themeScript = `(t=>{let l=localStorage,d=document.documentElement,a=l.getItem('app-theme'),r=l.getItem('theme')=='custom',m=window.matchMedia('(prefers-color-scheme:dark)').matches,n=l.getItem('app-night-theme'),y=l.getItem('app-day-theme');a&&d.setAttribute('data-theme',a);if(r)if(m&&n){d.setAttribute('data-theme',n);l.getItem('is-app-night-theme-dark')=='true'&&d.classList.add('dark')}else if(y){d.setAttribute('data-theme',y);l.getItem('is-app-day-theme-dark')=='true'&&d.classList.add('light')}})()`
export const isAmoledScript = `(t=>t&&document.documentElement.classList.add('amoled'))(localStorage.getItem('is-amoled'))`
export const fontScript = `(t=>{let l=localStorage,d=document.documentElement,f=l.getItem('app-font')||'friendly';d.setAttribute('data-font',f);if(f==='friendly'){d.classList.add('little-font')}else{d.classList.remove('little-font')}})()`

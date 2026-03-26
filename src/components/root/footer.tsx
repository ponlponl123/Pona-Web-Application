"use client"
import { useLanguageContext } from "@/contexts/languageContext"
import { langs } from "@/lib/i18n"
import {
  AtomIcon,
  BirdIcon,
  CubeIcon,
  GavelIcon,
  GithubLogoIcon,
  HeartIcon,
  PottedPlantIcon,
} from "@phosphor-icons/react/dist/ssr"
import { usePathname } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"

function Footer() {
  const pathname = usePathname() || ""
  const { language, setLanguage } = useLanguageContext()
  return (
    <footer
      className={`pona-footer z-10 max-md:flex-col ${pathname && pathname.startsWith("/app") ? "m-0" : "-mt-24"}`}
    >
      <div className="div w-fit max-md:order-1 md:max-w-64">
        <span className="-mb-4 text-xs opacity-50 max-md:text-center">
          Hello Pona! v.
          {process.env["NEXT_PUBLIC_APP_VERSION"] || "unknown"}
        </span>
        <span className="text-xs opacity-50 max-md:text-center">
          © 2024 - {new Date().getFullYear()} Pona! Application - Ponlponl123
          Projects. Licensed under MIT and Apache 2.0.
        </span>
        <span className="flex flex-wrap items-center gap-1 text-xs opacity-30 max-md:text-center">
          Made with <HeartIcon weight="fill" className="text-red-500" /> by{" "}
          <Link
            href="https://ponlponl123.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ponlponl123
          </Link>
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div className="div">
          <Link
            href="https://github.com/ponlponl123/Pona-Discord-Application"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubLogoIcon alt="Github" />
            {language.data.footer.links.github}
          </Link>
          <Link
            href="https://github.com/ponlponl123/Pona-Discord-Application/tree/main/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AtomIcon alt="Atom" />
            {language.data.footer.links.apidocs}
          </Link>
          <Link
            href="https://ponlponl123.com/discord"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BirdIcon alt="Bird" />
            {language.data.footer.links.support}
          </Link>
          <Link href="/community" rel="noopener noreferrer">
            <PottedPlantIcon alt="PottedPlant" />
            {language.data.community.title}
          </Link>
          <Link href="/status" rel="noopener noreferrer">
            <CubeIcon alt="Cube" />
            {language.data.footer.links.status}
          </Link>
          <Link
            href="https://law.ponlponl123.com/pona"
            rel="noopener noreferrer"
          >
            <GavelIcon alt="Gavel" />
            {language.data.footer.links.legal}
          </Link>
        </div>
        <div></div>
      </div>
      <div className="div max-md:-order-1 md:max-w-64">
        <Popover>
          <PopoverTrigger>
            <Avatar>
              <AvatarImage
                alt={language.key}
                className="h-4 w-4"
                src={`https://flagcdn.com/${language.country}.svg`}
              />
              <AvatarFallback>{language.key.toUpperCase()}</AvatarFallback>
            </Avatar>
            {language.key}
          </PopoverTrigger>
          <PopoverContent className="border-default-700/10 dark:border-default-900/10 w-32 border-2 px-4">
            {langs.map((lang) => {
              return (
                <Button key={lang.key} onClick={() => setLanguage(lang.key)}>
                  <Avatar>
                    <AvatarImage
                      alt={lang.key}
                      className="h-4 w-4"
                      src={`https://flagcdn.com/${lang.country}.svg`}
                    />
                    <AvatarFallback>{lang.key.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {lang.label}
                </Button>
              )
            })}
          </PopoverContent>
        </Popover>
      </div>
    </footer>
  )
}

export default Footer

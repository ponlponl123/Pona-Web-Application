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
import { useGlobalContext } from "@/contexts/globalContext"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { motion } from "motion/react"
import Link from "next/link"
import clsx from "clsx"

function Footer() {
  const pathname = usePathname() || ""
  const { language } = useLanguageContext()
  const { setIsLanguageModalOpen } = useGlobalContext()
  const isAppRoute = pathname.startsWith("/app")

  return (
    <footer
      className={clsx(
        "pona-footer z-10 max-md:flex-col",
        isAppRoute ? "m-0" : "-mt-24"
      )}
    >
      <div className="div w-fit max-md:order-1 md:max-w-64">
        <span className="block text-xs opacity-50 max-md:text-center">
          Hello Pona! v.{process.env["NEXT_PUBLIC_APP_VERSION"] || "unknown"}
        </span>
        <span className="block text-xs opacity-50 max-md:text-center">
          © 2024 - {new Date().getFullYear()} Pona! Application - Ponlponl123
          Projects. Licensed under MIT and Apache 2.0.
        </span>
        <span className="flex flex-wrap items-center gap-1 text-xs opacity-30 max-md:text-center">
          Made with <HeartIcon weight="fill" className="mx-1 text-red-500" /> by{" "}
          <Link
            href="https://ponlponl123.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Ponlponl123
          </Link>
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="https://github.com/ponlponl123/Pona-Discord-Application"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            <GithubLogoIcon alt="Github" />
            {language.data.footer.links.github}
          </Link>
          <Link
            href="https://github.com/ponlponl123/Pona-Discord-Application/tree/main/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            <AtomIcon alt="Atom" />
            {language.data.footer.links.apidocs}
          </Link>
          <Link
            href="https://ponlponl123.com/discord"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            <BirdIcon alt="Bird" />
            {language.data.footer.links.support}
          </Link>
          <Link
            href="/community"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            <PottedPlantIcon alt="PottedPlant" />
            {language.data.community.title}
          </Link>
          <Link
            href="/status"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            <CubeIcon alt="Cube" />
            {language.data.footer.links.status}
          </Link>
          <Link
            href="https://law.ponlponl123.com/pona"
            className="flex items-center gap-1 hover:text-primary"
            rel="noopener noreferrer"
          >
            <GavelIcon alt="Gavel" />
            {language.data.footer.links.legal}
          </Link>
        </div>
      </div>

      <div className="div max-md:-order-1 md:max-w-64">
        <motion.div layoutId="language-selector-modal">
          <Button
            className="rounded-2xl border-2"
            size="lg"
            variant="outline"
            onClick={() => setIsLanguageModalOpen(true)}
          >
            <Avatar className="h-4 w-4">
              <AvatarImage
                alt={language.key}
                src={`https://flagcdn.com/${language.country}.svg`}
              />
              <AvatarFallback>{language.key.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium tracking-widest">
              {language.label}
            </span>
          </Button>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

"use client"
import { useLanguageContext } from "@/contexts/languageContext"
import {
  BirdIcon,
  CubeIcon,
  GavelIcon,
  GithubLogoIcon,
  HardHatIcon,
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
import { cn } from "@/lib/utils"

function Footer() {
  const pathname = usePathname() || ""
  const { language } = useLanguageContext()
  const { setIsLanguageModalOpen, isLanguageModalOpen } = useGlobalContext()
  const isAppRoute = pathname.startsWith("/app")

  return (
    <motion.footer
      layout
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
        <div className="flex flex-wrap justify-center gap-2">
          {[
            {
              href: "https://github.com/ponlponl123/Pona-Discord-Application",
              icon: GithubLogoIcon,
              label: language.data.footer.links.github,
            },
            {
              href: "https://ponlponl123.com/discord",
              icon: BirdIcon,
              label: language.data.footer.links.support,
            },
            {
              href: "/community",
              icon: PottedPlantIcon,
              label: language.data.community.title,
            },
            {
              href: "/status",
              icon: CubeIcon,
              label: language.data.footer.links.status,
            },
            {
              href: "/updates",
              icon: HardHatIcon,
              label: language.data.footer.links.updates,
            },
            {
              href: "https://law.ponlponl123.com/pona",
              icon: GavelIcon,
              label: language.data.footer.links.legal,
            },
          ].map((link, i) => (
            <Link
              key={i}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
            >
              <Button
                className="flex items-center gap-1 rounded-xl hover:text-primary"
                variant={"ghost"}
                data-smooth-interaction="true"
              >
                <link.icon alt={link.label} />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="div max-md:-order-1 md:max-w-64">
        <motion.div layoutId="language-selector-modal">
          <Button
            className={cn(
              "rounded-2xl border-2",
              isLanguageModalOpen && "invisible"
            )}
            size="lg"
            variant="outline"
            onClick={() => setIsLanguageModalOpen(true)}
            data-smooth-interaction="true"
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
    </motion.footer>
  )
}

export default Footer

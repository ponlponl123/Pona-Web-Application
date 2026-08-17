"use client"
import React from "react"
import confetti from "canvas-confetti"
import { langs } from "@/lib/i18n"
import { fonts_credits } from "@/consts/fonts-author"
import Image from "next/image"
import {
  ArticleIcon,
  GitMergeIcon,
  HeartIcon,
  PottedPlantIcon,
  TextAaIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/store/coreStore"

function Page() {
  const language = useAppStore((state) => state.language)
  const heartFalled = React.useRef(false)

  React.useEffect(() => {
    const heart = confetti.shapeFromPath({
      path: "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z",
    })

    const duration = 12 * 1000
    const animationEnd = Date.now() + duration
    let skew = 12

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min

    ;(function frame() {
      if (window.location.pathname !== "/community" || heartFalled.current)
        return
      const timeLeft = animationEnd - Date.now()
      const ticks = Math.max(64, 256 * (timeLeft / duration))
      skew = Math.max(0.8, skew - 0.001)

      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: ticks,
        origin: {
          x: Math.random(),
          y: Math.random() * skew - 0.2,
        },
        colors: ["#fb6490"],
        shapes: [heart],
        gravity: randomInRange(0.2, 0.6),
        scalar: randomInRange(0.4, 1.5),
        drift: randomInRange(-0.6, 0.6),
      })

      if (timeLeft > 0) {
        requestAnimationFrame(frame)
      } else {
        heartFalled.current = true
      }
    })()
  }, [])

  return (
    <main className="relative min-h-dvh w-full">
      <div className="absolute z-0 h-[48vh] max-h-96 min-h-24 w-full max-w-none! overflow-hidden opacity-60 blur-3xl">
        <Image
          src={"/static/community-backdrop.png"}
          width={1920}
          height={1080}
          alt="Pona! Community"
          className="w-full scale-[1.1] object-cover"
        />
      </div>
      <div className="relative z-1 flex min-h-dvh grid-rows-[20px_1fr_20px] flex-col items-center gap-8 p-8 pb-20 sm:p-20">
        <div className="mt-12"></div>
        <main className="flex w-full max-w-5xl flex-col justify-start gap-10 pb-12">
          <div className="flex flex-row items-center justify-between">
            <h1 className="flex items-center gap-4 text-5xl">
              <PottedPlantIcon alt="PottedPlant" />
              {language.data.community.title}
            </h1>
            <div className="relative">
              <HeartIcon
                alt="By Pona!"
                weight="fill"
                className="rotate-12 text-rose-500"
                size={96}
              />
              <HeartIcon
                alt="Loves!"
                weight="fill"
                className="absolute top-0 right-0 -translate-y-full -rotate-12 text-rose-500"
                size={32}
              />
            </div>
          </div>
          <h2 className="-mt-12 text-2xl font-bold">
            {language.data.community.description}
          </h2>
          <section className="rounded-3xl border-2 border-foreground/5 bg-foreground/5 p-8">
            <h2 className="flex items-center gap-4 text-4xl font-bold">
              <TextAaIcon size={24} /> {language.data.community.fonts.title}
            </h2>
            <div className="flex flex-col">
              {fonts_credits.map((font, index) => (
                <div key={index} className="flex flex-col gap-2 p-4">
                  <h4>
                    {font.title} · {font.name} ·{" "}
                    <Link target="_blank" href={font.link}>
                      {font.author}
                    </Link>
                  </h4>
                  <h1>{font.lorem}</h1>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border-2 border-foreground/5 bg-foreground/5 p-8">
            <h2 className="flex items-center gap-4 text-4xl font-bold">
              <ArticleIcon size={24} />{" "}
              {language.data.community.translator.title}
            </h2>
            <div className="flex flex-col">
              {langs.map((lang, index) => (
                <div key={index} className="flex flex-col gap-2 p-4">
                  <h4 className="text-sm">{lang.label}</h4>
                  <div className="flex flex-wrap gap-2">
                    {lang.data.translators.map((translator, key) => (
                      <h1 className="text-lg" key={key}>
                        {translator}
                      </h1>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border-2 border-foreground/5 bg-foreground/5 p-8">
            <h2 className="flex items-center gap-4 text-4xl font-bold">
              <GitMergeIcon size={24} />{" "}
              {language.data.community.contributors.title}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="h-max w-max"
                href="https://github.com/Ponlponl123"
                target="_blank"
              >
                <Avatar>
                  <AvatarImage
                    src="https://github.com/Ponlponl123.png"
                    alt="Ponlponl123"
                  />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </main>
  )
}

export default Page

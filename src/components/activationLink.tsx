"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Icon as IconType } from "@phosphor-icons/react"
import { usePathname } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import React, { useCallback, useEffect, useRef, useState } from "react"

interface ActivationLinkProps {
  href?: string
  children?: React.ReactNode
  icon?: IconType
  iconSize?: number
  onClick?: () => void
  className?: string
  isActive?: boolean
  iconOnly?: boolean
  isDisabled?: boolean
}

function ActivationLink({
  href,
  children,
  icon: Icon,
  iconSize = 16,
  onClick,
  className = "",
  isActive = false,
  iconOnly = false,
  isDisabled = false,
}: ActivationLinkProps) {
  const router = useRouter()
  const pathname = usePathname() || ""
  const isSection = href?.startsWith("#")
  const sectionId = href?.substring(1)

  const appRef = useRef<HTMLElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const sectionsRef = useRef<NodeListOf<HTMLElement> | null>(null)

  const [activeSection, setActiveSection] = useState<string | null>(null)

  let isHere = isActive

  if (isSection && sectionId) {
    const isExactSection = activeSection === sectionId
    const isGroupTitleActive =
      !sectionId.includes("-") && activeSection?.startsWith(`${sectionId}-`)

    isHere = isHere || isExactSection || Boolean(isGroupTitleActive)
  } else if (!isSection && href) {
    const isExactRoute = pathname === href
    const isParentRouteActive = pathname.startsWith(`${href}/`)

    isHere = isHere || isExactRoute || isParentRouteActive
  }

  const clicked = () => {
    if (isSection && sectionId) {
      const sectionElement = document.getElementById(sectionId)
      if (sectionElement && appRef.current) {
        const appTop = appRef.current.getBoundingClientRect().top
        const offset = sectionId.includes("-") ? 156 : 96
        const sectionTop = sectionElement.getBoundingClientRect().top - offset

        appRef.current.scrollTo({
          top: sectionTop - appTop + appRef.current.scrollTop,
          behavior: "smooth",
        })
      }
    }

    if (onClick) onClick()
    if (!isSection && href) router.push(href)
  }

  const handleScroll = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (!appRef.current || !sectionsRef.current) return

      const pageYOffset = appRef.current.scrollTop

      let newActiveSection: string = ""

      sectionsRef.current.forEach((section: HTMLElement) => {
        const sectionOffsetTop = section.offsetTop - 256
        const sectionHeight = section.offsetHeight

        if (
          pageYOffset >= sectionOffsetTop &&
          pageYOffset < sectionOffsetTop + sectionHeight
        ) {
          newActiveSection = section.id
        }
      })

      setActiveSection(newActiveSection !== "" ? newActiveSection : null)

      const parentGroup = buttonRef.current?.closest(".group-menu")

      if (parentGroup && href && newActiveSection !== "") {
        const sectionPrefix = newActiveSection.split("-")[0]
        const hrefPrefix = href.substring(1).split("-")[0]

        if (sectionPrefix === hrefPrefix) {
          parentGroup.classList.add("active")
        } else {
          parentGroup.classList.remove("active")
        }
      }
    })
  }, [href, setActiveSection])

  useEffect(() => {
    if (isSection) {
      appRef.current = document.querySelector("#app-content")
      if (appRef.current) {
        sectionsRef.current = document.querySelectorAll("[data-section]")
        appRef.current.addEventListener("scroll", handleScroll, {
          passive: true,
        })
        handleScroll()

        return () => {
          appRef.current?.removeEventListener("scroll", handleScroll)
        }
      }
    } else if (href) {
      const parentGroup = buttonRef.current?.closest(".group-menu")
      if (parentGroup) {
        const controlby = parentGroup.getAttribute("aria-label")
        if (controlby && pathname.includes(controlby)) {
          parentGroup.classList.add("active")
        } else {
          parentGroup.classList.remove("active")
        }
      }
    }
  }, [isSection, handleScroll, href, pathname])

  return (
    <div className="block w-full overflow-hidden rounded-lg duration-0">
      <Button
        onClick={clicked}
        ref={buttonRef}
        className={cn(
          `w-full justify-start rounded-lg`,
          iconOnly && "size-10",
          className
        )}
        variant={isHere ? "default" : "ghost"}
        size={iconOnly ? "icon" : "lg"}
        disabled={isDisabled}
        data-smooth-interaction="true"
      >
        {iconOnly && Icon ? (
          <div className="m-auto">
            <Icon weight={isHere ? "fill" : "bold"} size={iconSize} />
          </div>
        ) : (
          <>
            {Icon && (
              <Icon
                weight={isHere ? "fill" : "bold"}
                size={iconSize}
                className="mr-2"
              />
            )}
            {children}
          </>
        )}
      </Button>
    </div>
  )
}

export default ActivationLink

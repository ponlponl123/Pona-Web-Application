"use client"
import React from "react"
import Link from "next/link"
import { Button } from "../ui/button"
import { AnimatePresence, motion } from "motion/react"
import { useLanguageContext } from "@/contexts/languageContext"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { FieldGroup } from "../ui/field"
import CardCheckbox from "../ui/custom/checkbox"
import { LockSimpleIcon } from "@phosphor-icons/react/dist/ssr"

function UpdateSubscribeModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { language } = useLanguageContext()
  const { userInfo } = useDiscordUserInfo()
  const [groupSelected, setGroupSelected] = React.useState<string[]>([])

  const closeModal = () => setIsOpen(false)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-2 backdrop-blur-md"
        >
          <motion.div
            layoutId="update-subscribe"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-4xl border-2 border-foreground/10 bg-card/90 p-6 shadow-xl"
            tabIndex={-1}
          >
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                {language.data.app.updates.subscription.modal.checklist}
              </h1>
              <p className="text-sm text-foreground">
                {language.data.app.updates.subscription.modal.body1}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex w-full flex-col gap-1">
                  <FieldGroup className={"w-full"}>
                    {userInfo ? (
                      <>
                        {userInfo && userInfo?.email && (
                          <CardCheckbox
                            name="email"
                            title="Email"
                            description={userInfo.email}
                            onCheckedChange={(value) => {
                              if (value) {
                                setGroupSelected((v) => {
                                  const n = v
                                  n.push("email")
                                  return n
                                })
                              } else {
                                setGroupSelected((v) => {
                                  return v.filter((n) => n !== "email")
                                })
                              }
                            }}
                            disabled={true}
                          />
                        )}
                        {userInfo && userInfo.username && (
                          <CardCheckbox
                            name="discord"
                            title="Discord DMs"
                            description={`@${userInfo.username}`}
                            onCheckedChange={(value) => {
                              if (value) {
                                setGroupSelected((v) => {
                                  const n = v
                                  n.push("discord")
                                  return n
                                })
                              } else {
                                setGroupSelected((v) => {
                                  return v.filter((n) => n !== "discord")
                                })
                              }
                            }}
                            disabled={true}
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed bg-foreground/5 p-12">
                        <LockSimpleIcon weight="bold" className="size-6" />
                        <h2 className="text-lg">
                          {language.data.common.login_first}
                        </h2>
                      </div>
                    )}
                  </FieldGroup>
                </div>
                <p className="text-sm">
                  {language.data.app.updates.subscription.modal.body2
                    .split("[link]")
                    .map((part, index) =>
                      index === 1 ? (
                        <React.Fragment key={index}>
                          <Link
                            className="px-1.5 text-sm"
                            target="_blank"
                            href="https://github.com/Ponlponl123/Pona-Discord-Application"
                          >
                            Pona! Repository
                          </Link>
                          {part}
                        </React.Fragment>
                      ) : (
                        <React.Fragment key={index}>{part}</React.Fragment>
                      )
                    )}
                </p>
              </div>
              <div className="mt-6 flex w-full justify-end gap-2">
                <Button
                  size={"lg"}
                  variant={"ghost"}
                  className={"rounded-full px-6"}
                  onClick={closeModal}
                  data-smooth-interaction="true"
                >
                  {language.data.app.updates.subscription.modal.notnow}
                </Button>
                <Button
                  size={"lg"}
                  className={"rounded-full px-6"}
                  onClick={closeModal}
                  data-smooth-interaction="true"
                >
                  {groupSelected.length === 0
                    ? language.data.app.updates.subscription.modal.update
                    : language.data.app.updates.subscription.modal.letnotify}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UpdateSubscribeModal

"use client"
import React from "react"
import Link from "next/link"
import { Button } from "../ui/button"
import { AnimatePresence, motion } from "motion/react"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { LockSimpleIcon, MegaphoneSimpleIcon } from "@phosphor-icons/react"
import CustomScrollArea from "../ui/custom/scroll-area"
import CardCheckbox from "../ui/custom/checkbox"
import { useAppStore } from "@/store/coreStore"
import { FieldGroup } from "../ui/field"
import Modal from "../ui/custom/modal"

function UpdateSubscribeModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const language = useAppStore((state) => state.language)
  const { userInfo } = useDiscordUserInfo()
  const [groupSelected, setGroupSelected] = React.useState<string[]>([])

  const closeModal = () => setIsOpen(false)

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} layoutId="update-subscribe">
      <Modal.Header>
        <Modal.Title>
          {language.data.app.updates.subscription.modal.checklist}
        </Modal.Title>
        <Modal.Description>
          {language.data.app.updates.subscription.modal.body1}
        </Modal.Description>
      </Modal.Header>
      <Modal.Body>
        <div className="flex h-full flex-col gap-3 px-6">
          <div className="flex w-full flex-col gap-1">
            <FieldGroup className={"w-full"}>
              {userInfo ? (
                <div className="-mb-3 flex flex-col gap-3">
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
                </div>
              ) : (
                <div className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed bg-foreground/5 p-12">
                  <LockSimpleIcon weight="bold" className="size-6" />
                  <h2 className="text-lg">
                    {language.data.common.login_first}
                  </h2>
                </div>
              )}
              <Link
                href="https://ponl.link/disgd"
                target="_blank"
                tabIndex={-1}
              >
                <Button
                  className="w-full justify-start gap-4 rounded-lg border-2 border-foreground/10 bg-transparent px-4 py-8 text-foreground hover:bg-foreground/5"
                  data-smooth-interaction="true"
                >
                  <MegaphoneSimpleIcon weight="bold" className="size-4" />
                  <div className="flex min-w-0 flex-1 flex-col items-start justify-start gap-1">
                    <h1 className="text-start text-base font-bold">
                      {
                        language.data.app.updates.subscription.modal.options
                          .official_discord.title
                      }
                    </h1>
                    <span className="line-clamp-2 w-full text-start wrap-break-word whitespace-break-spaces">
                      {
                        language.data.app.updates.subscription.modal.options
                          .official_discord.description
                      }
                    </span>
                  </div>
                </Button>
              </Link>
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
      </Modal.Body>
      <Modal.Footer>
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
      </Modal.Footer>
    </Modal>
  )
}

export default UpdateSubscribeModal

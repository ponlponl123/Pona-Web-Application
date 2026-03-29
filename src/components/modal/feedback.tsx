"use client"
import React from "react"
import { Button } from "../ui/button"
import { useLanguageContext } from "@/contexts/languageContext"
import { useGlobalContext } from "@/contexts/globalContext"
import { Input } from "react-smooth-input"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import Modal from "../ui/custom/modal"
import { Field } from "../ui/field"
import { Label } from "../ui/label"
import { HeartIcon, SmileyWinkIcon } from "@phosphor-icons/react"

function FeedbackModal() {
  const { language } = useLanguageContext()
  const { isFeedbackModalOpen, setIsFeedbackModalOpen } = useGlobalContext()
  const [isCanWeContactBack, setIsCanWeContactBack] = React.useState(false)

  const closeModal = () => setIsFeedbackModalOpen(false)

  return (
    <Modal
      isOpen={isFeedbackModalOpen}
      setIsOpen={setIsFeedbackModalOpen}
      layoutId="feedback-modal"
      className="h-112"
    >
      <Modal.Header>
        <Modal.Title className="flex items-center justify-between">
          {language.data.modal.feedback.title}
          <SmileyWinkIcon weight="fill" className="mt-1" />
        </Modal.Title>
        <Modal.Description className="text-base text-foreground/60">
          {language.data.modal.feedback.description}
        </Modal.Description>
      </Modal.Header>
      <Modal.Body
        classNames={{
          viewport: "flex min-h-0 flex-1 flex-col",
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-6 pb-6">
          <form className="flex min-h-0 flex-1 flex-col gap-3">
            <Textarea
              className="min-h-0 flex-1 rounded-xl border-2 border-transparent bg-foreground/10! text-sm! tracking-wider hover:border-foreground/10 hover:bg-foreground/5!"
              placeholder={language.data.modal.feedback.placeholder}
            />
            <Field orientation="horizontal">
              <Checkbox
                id="terms-checkbox"
                name="terms-checkbox"
                className="rounded-sm border-2"
                onCheckedChange={setIsCanWeContactBack}
                checked={isCanWeContactBack}
              />
              <Label htmlFor="terms-checkbox" className="tracking-wider">
                {language.data.modal.feedback.can_we_contact_back}
              </Label>
            </Field>
            {isCanWeContactBack && (
              <Input
                type="text"
                placeholder={language.data.modal.feedback.email}
                fontStyle={{
                  fontFamily:
                    "var(--font-ponlponl123-article), var(--font-sn-sanafon-maru-j30), sans-serif",
                  fontWeight: "bold",
                  fontSize: "14px",
                  letterSpacing: "1px",
                }}
              />
            )}
          </form>
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
          {language.data.modal.feedback.options.cancel}
        </Button>
        <Button
          size={"lg"}
          className={"rounded-full px-6"}
          onClick={closeModal}
          data-smooth-interaction="true"
        >
          <HeartIcon weight="fill" />
          {language.data.modal.feedback.options.submit}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default FeedbackModal

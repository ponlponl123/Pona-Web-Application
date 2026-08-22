"use client"
import React from "react"
import { Button } from "../ui/button"
import { Input } from "react-smooth-input"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import Modal from "../ui/custom/modal"
import { Field } from "../ui/field"
import { Label } from "../ui/label"
import {
  HeartIcon,
  PaperPlaneTiltIcon,
  SmileyWinkIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { PuffLoader } from "react-spinners"
import { emailRegex } from "@/consts/regex"
import { useAppStore } from "@/store/coreStore"
import { AnimatePresence, motion } from "motion/react"
import { isFeedbackModalOpenAtom } from "@/store/uiAtoms"
import { useAtom } from "jotai"

function FeedbackModal() {
  const language = useAppStore((state) => state.language)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useAtom(
    isFeedbackModalOpenAtom
  )
  const [isCanWeContactBack, setIsCanWeContactBack] = React.useState(false)
  const [textAreaValue, setTextAreaValue] = React.useState("")
  const [textAreaError, setTextAreaError] = React.useState("")
  const [inputValue, setInputValue] = React.useState("")
  const [inputError, setInputError] = React.useState("")
  const [isFormDisabled, setIsFormDisabled] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [isCompleted, setIsCompleted] = React.useState(false)

  const sendIt = async () => {
    let isError = false
    if (textAreaValue.replace(/\s/g, "").length === 0) {
      setTextAreaError(language.data.modal.feedback.empty_textarea)
      isError = true
    }
    if (
      isCanWeContactBack &&
      (inputValue.length === 0 || !emailRegex.test(inputValue))
    ) {
      setInputError(language.data.modal.feedback.invalid_email)
      isError = true
    }
    if (isError) return
    setIsSending(true)
    setIsFormDisabled(true)
    try {
      const formData = new FormData()
      formData.set("message", textAreaValue)
      if (isCanWeContactBack) {
        formData.set("email", inputValue)
      }
      const response = await fetch(
        "https://api.ponlponl123.com/v1/services/pona/feedback",
        {
          method: "POST",
          body: formData,
        }
      )

      if (response.ok) {
        setIsCompleted(true)
        return
      }
      const body = await response.text()
      if (body === "Invalid Body") {
        setTextAreaError(language.data.modal.feedback.empty_textarea)
      } else if (
        body === "Invalid Email Syntax" ||
        body === "Email Domain Unreachable"
      ) {
        setInputError(language.data.modal.feedback.invalid_email)
      } else {
        setTextAreaError(language.data.modal.feedback.server_error)
        setInputError(language.data.modal.feedback.server_error)
      }
    } catch (error) {
      console.error(error)
      setTextAreaError(language.data.modal.feedback.server_error)
      setInputError(language.data.modal.feedback.server_error)
    } finally {
      setIsSending(false)
      setIsFormDisabled(false)
    }
  }

  const closeModal = () => setIsFeedbackModalOpen(false)

  return (
    <Modal
      isOpen={isFeedbackModalOpen}
      setIsOpen={setIsFeedbackModalOpen}
      layoutId="feedback-modal"
      className="h-112"
    >
      {isCompleted ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            delay: 0.48,
            duration: 1,
            ease: "easeOut",
          }}
          className="flex min-h-0 flex-1 text-center"
        >
          <Modal.Body
            classNames={{
              viewport:
                "flex min-h-0 flex-1 flex-col justify-center items-center",
            }}
          >
            <motion.div layoutId="header-icon">
              <HeartIcon className="mb-3 size-10 text-rose-400" weight="fill" />
            </motion.div>
            <h1 className="mb-2 text-xl font-bold">
              {language.data.modal.feedback.completed.title}
            </h1>
            <p className="text-foreground/60">
              {language.data.modal.feedback.completed.description}
            </p>
          </Modal.Body>
        </motion.div>
      ) : (
        <>
          <Modal.Header>
            <Modal.Title className="flex items-center justify-between">
              {language.data.modal.feedback.title}
              <motion.div layoutId="header-icon">
                <SmileyWinkIcon weight="fill" className="mt-1" />
              </motion.div>
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
            <div className="relative flex min-h-0 flex-1 flex-col gap-3 px-6 pb-6">
              <AnimatePresence mode="popLayout">
                <motion.div className="contents">
                  <form
                    className={cn(
                      "flex min-h-0 flex-1 flex-col gap-3",
                      isFormDisabled &&
                        "pointer-events-none opacity-20 blur-[2px]"
                    )}
                  >
                    <motion.div
                      className="flex min-h-0 flex-1 flex-col"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <Textarea
                        className="min-h-0 flex-1 rounded-xl border-2 border-transparent bg-foreground/10! text-sm! tracking-wider hover:border-foreground/10 hover:bg-foreground/5!"
                        placeholder={language.data.modal.feedback.placeholder}
                        onChange={(e) => {
                          setTextAreaValue(e.target.value)
                          setTextAreaError("")
                        }}
                        disabled={isFormDisabled}
                        aria-invalid={textAreaError.length > 0}
                        value={textAreaValue}
                      />
                      {textAreaError.length > 0 && (
                        <span className="mt-1 text-sm text-danger">
                          {textAreaError}
                        </span>
                      )}
                    </motion.div>
                    <motion.div
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <Field
                        orientation="horizontal"
                        data-smooth-interaction="true"
                        className="w-max"
                      >
                        <Checkbox
                          id="terms-checkbox"
                          name="terms-checkbox"
                          className="rounded-sm border-2"
                          onCheckedChange={setIsCanWeContactBack}
                          checked={isCanWeContactBack}
                          disabled={isFormDisabled}
                        />
                        <Label
                          htmlFor="terms-checkbox"
                          className="tracking-wider"
                        >
                          {language.data.modal.feedback.can_we_contact_back}
                        </Label>
                      </Field>
                    </motion.div>
                    <motion.div
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {isCanWeContactBack && (
                        <>
                          <Input
                            type="text"
                            placeholder={language.data.modal.feedback.email}
                            onChange={(e) => {
                              setInputValue(e.target.value)
                              setInputError("")
                            }}
                            value={inputValue}
                            fontStyle={{
                              fontFamily:
                                "var(--font-app), sans-serif",
                              fontWeight: "bold",
                              fontSize: "14px",
                              letterSpacing: "1px",
                            }}
                            disabled={isFormDisabled}
                            classNames={{
                              base: cn(
                                "bg-foreground/10! text-sm! tracking-wider",
                                "hover:border-foreground/10 hover:bg-foreground/5 hover:dark:border-foreground/10",
                                "data-[focused=true]:border-foreground/10! data-[focused=true]:bg-foreground/5!",
                                "data-[focused=true]:dark:border-foreground/10! data-[focused=true]:dark:bg-foreground/5!",
                                inputError.length > 0 && ""
                              ),
                            }}
                          />
                          {inputError.length > 0 && (
                            <span className="mt-1 text-sm text-danger">
                              {inputError}
                            </span>
                          )}
                        </>
                      )}
                    </motion.div>
                  </form>
                  {isSending && (
                    <motion.div
                      className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.24,
                        ease: "easeOut",
                      }}
                    >
                      <motion.div className="flex flex-col items-center justify-center">
                        <PaperPlaneTiltIcon weight="fill" className="size-6" />
                        <motion.div className="absolute">
                          <PuffLoader color="var(--foreground)" />
                        </motion.div>
                      </motion.div>
                      <span>{language.data.modal.feedback.sending}</span>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Modal.Body>
          <Modal.Footer
            className={cn(
              isFormDisabled && "pointer-events-none opacity-20 blur-[2px]"
            )}
          >
            <Button
              size={"lg"}
              variant={"ghost"}
              className={"rounded-full px-6 hover:translate-y-5 hover:blur-xs"}
              onClick={closeModal}
              data-smooth-interaction="true"
            >
              {language.data.modal.feedback.options.cancel}
            </Button>
            <motion.button
              className={
                "flex items-center justify-center gap-2 rounded-full border-0 bg-primary px-6 text-primary-foreground hover:scale-105 hover:bg-primary/20 hover:text-primary active:scale-75"
              }
              onClick={sendIt}
              data-smooth-interaction="true"
              whileHover="hoverAction"
            >
              <motion.div
                variants={{
                  hoverAction: {
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 0],
                    y: [0, -2, 0],
                    transition: {
                      duration: 0.72,
                      ease: "easeInOut",
                    },
                  },
                }}
              >
                <HeartIcon weight="fill" />
              </motion.div>
              {language.data.modal.feedback.options.submit}
            </motion.button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default FeedbackModal

"use client"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "../field"
import { Checkbox } from "../checkbox"
import { CheckboxRootProps } from "@base-ui/react"
import { cn } from "@/lib/utils"

function CardCheckbox({
  orientation = "horizontal",
  name,
  title,
  value,
  description,
  disabled,
  onCheckedChange,
}: {
  orientation?: "vertical" | "horizontal" | "responsive" | null | undefined
  name: string
  title: string
  value?: string
  description?: string
  disabled?: boolean
  onCheckedChange?: CheckboxRootProps["onCheckedChange"]
}) {
  return (
    <FieldLabel
      className={cn(
        "rounded-lg! border-2! px-2 hover:bg-foreground/5",
        disabled && "pointer-events-none bg-foreground/5 opacity-40"
      )}
      data-smooth-interaction="true"
      data-disabled={disabled}
    >
      <Field
        data-disabled={disabled}
        orientation={orientation}
        className="items-center! gap-4"
      >
        <Checkbox
          value={value}
          id={name}
          name={name}
          onCheckedChange={onCheckedChange}
          className={"rounded-md"}
          disabled={disabled}
        />
        <FieldContent>
          <FieldTitle className="text-base leading-6 tracking-wide">
            {title}
          </FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldContent>
      </Field>
    </FieldLabel>
  )
}

export default CardCheckbox

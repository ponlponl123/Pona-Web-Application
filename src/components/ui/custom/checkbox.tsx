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

function CardCheckbox({
  orientation = "horizontal",
  name,
  title,
  value,
  description,
  onCheckedChange,
}: {
  orientation?: "vertical" | "horizontal" | "responsive" | null | undefined
  name: string
  title: string
  value?: string
  description?: string
  onCheckedChange?: CheckboxRootProps["onCheckedChange"]
}) {
  return (
    <FieldLabel
      className="rounded-lg! border-2! hover:bg-foreground/5"
      data-smooth-interaction="true"
    >
      <Field orientation={orientation} className="items-center! gap-3">
        <Checkbox
          value={value}
          id={name}
          name={name}
          onCheckedChange={onCheckedChange}
          className={"rounded-md"}
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

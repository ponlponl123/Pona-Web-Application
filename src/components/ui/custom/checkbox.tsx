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
    <FieldLabel>
      <Field orientation={orientation}>
        <Checkbox
          value={value}
          id={name}
          name={name}
          onCheckedChange={onCheckedChange}
        />
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldContent>
      </Field>
    </FieldLabel>
  )
}

export default CardCheckbox

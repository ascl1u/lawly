import * as React from "react"

type FormFieldContextValue = {
  name: string
  value: string
  error?: string
  onChange: (value: string) => void
}

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
  undefined
)

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  if (!fieldContext) {
    throw new Error("useFormField must be used within a FormField")
  }
  return fieldContext
}

export const FormFieldProvider = FormFieldContext.Provider 
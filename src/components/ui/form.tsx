import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
  <form
    ref={ref}
    className={cn("space-y-6", className)}
    {...props}
  />
))
Form.displayName = "Form"

interface FormFieldContextValue {
  id: string
  name: string
  value: string
  error?: string
  onChange: (value: string) => void
}

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
  undefined
)

interface FormFieldProps {
  name: string
  value: string
  error?: string
  onChange: (value: string) => void
  className?: string
  children?: React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ name, value, error, onChange, children, className, ...props }, ref) => {
    const id = React.useId()
    
    return (
      <FormFieldContext.Provider 
        value={{ id, name, value, error, onChange }}
      >
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {children}
        </div>
      </FormFieldContext.Provider>
    )
  }
)
FormField.displayName = "FormField"

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  if (!fieldContext) {
    throw new Error("useFormField must be used within a FormField")
  }
  return fieldContext
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  />
))
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { id } = useFormField()
  return (
    <Label
      ref={ref}
      htmlFor={id}
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { id } = useFormField()
  return (
    <div ref={ref} id={id} className={cn("mt-2", className)} {...props} />
  )
})
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { error } = useFormField()
  if (!error) return null

  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {error}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} 
import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  helpText?: string
  error?: string
}

export interface TextFieldInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface TextFieldLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const TextFieldInput = React.forwardRef<HTMLInputElement, TextFieldInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
TextFieldInput.displayName = "TextFieldInput"

const TextFieldLabel = React.forwardRef<HTMLLabelElement, TextFieldLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
TextFieldLabel.displayName = "TextFieldLabel"

const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  ({ className, label, helpText, error, children, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        {children}
        {helpText && !error && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
TextField.displayName = "TextField"

// Compound component pattern
const TextFieldNamespace = Object.assign(TextField, {
  Input: TextFieldInput,
  Label: TextFieldLabel,
})

export { TextFieldNamespace as TextField }

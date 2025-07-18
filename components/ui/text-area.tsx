import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  helpText?: string
  error?: string
}

export interface TextAreaInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextAreaInput = React.forwardRef<HTMLTextAreaElement, TextAreaInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
TextAreaInput.displayName = "TextAreaInput"

const TextArea = React.forwardRef<HTMLDivElement, TextAreaProps>(
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
TextArea.displayName = "TextArea"

// Compound component pattern
const TextAreaNamespace = Object.assign(TextArea, {
  Input: TextAreaInput,
})

export { TextAreaNamespace as TextArea }

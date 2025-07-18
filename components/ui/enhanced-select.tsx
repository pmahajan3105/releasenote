import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "../../lib/utils"
import { 
  Select as BaseSelect, 
  SelectContent, 
  SelectItem as BaseSelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./select"

export interface EnhancedSelectProps {
  label?: string
  placeholder?: string
  helpText?: string
  error?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const EnhancedSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <BaseSelectItem ref={ref} className={className} {...props}>
    {children}
  </BaseSelectItem>
))
EnhancedSelectItem.displayName = "EnhancedSelectItem"

const EnhancedSelect = React.forwardRef<HTMLButtonElement, EnhancedSelectProps>(
  ({ className, label, placeholder, helpText, error, value, onValueChange, children, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <BaseSelect value={value} onValueChange={onValueChange}>
          <SelectTrigger ref={ref}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </BaseSelect>
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
EnhancedSelect.displayName = "EnhancedSelect"

// Compound component pattern
const EnhancedSelectNamespace = Object.assign(EnhancedSelect, {
  Item: EnhancedSelectItem,
})

export { EnhancedSelectNamespace as Select }

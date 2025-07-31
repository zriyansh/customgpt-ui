/**
 * Input Component
 * 
 * Reusable input field component with consistent styling.
 * Supports all standard HTML input attributes and types.
 * 
 * Features:
 * - Consistent height and padding
 * - Focus ring for accessibility
 * - Disabled state styling
 * - Placeholder text styling
 * - File input support
 * - Full width by default
 * - Brand color focus ring
 * 
 * Styling:
 * - Gray border in default state
 * - Brand color focus ring
 * - Smooth transitions
 * - Disabled opacity
 * - Custom file input styling
 * 
 * Usage:
 * <Input type="text" placeholder="Enter text..." />
 * <Input type="email" required />
 * <Input type="file" accept="image/*" />
 * <Input disabled value="Disabled input" />
 * 
 * Customization for contributors:
 * - Add error state styling
 * - Implement input group support
 * - Add size variants (sm, md, lg)
 * - Add left/right icon support
 * - Implement floating labels
 * - Add input masking
 * - Add character counter
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input component props
 * Extends all standard HTML input attributes
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input Component
 * 
 * Forward ref component for proper ref handling.
 * Applies consistent styling to all input types.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          // Focus styles
          "ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          // File input styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Placeholder styles
          "placeholder:text-gray-400",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Custom classes
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
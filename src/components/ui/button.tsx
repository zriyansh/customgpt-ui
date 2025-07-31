/**
 * Button Component
 * 
 * Reusable button component with multiple variants and sizes.
 * Built with class-variance-authority for type-safe styling.
 * 
 * Variants:
 * - default: Primary brand button with shadow
 * - destructive: Red danger button for destructive actions
 * - outline: Secondary button with border
 * - secondary: Gray background button
 * - ghost: Transparent button with hover state
 * - link: Text-only button styled as link
 * 
 * Sizes:
 * - default: Standard size (h-10)
 * - sm: Small size (h-8)
 * - lg: Large size (h-12)
 * - icon: Square icon button (10x10)
 * 
 * Features:
 * - Full keyboard accessibility
 * - Focus ring for keyboard navigation
 * - Disabled state handling
 * - Smooth transitions
 * - Responsive to all button HTML attributes
 * 
 * Usage examples:
 * <Button>Click me</Button>
 * <Button variant="destructive">Delete</Button>
 * <Button size="sm" variant="outline">Cancel</Button>
 * <Button size="icon" variant="ghost"><Icon /></Button>
 * 
 * Customization for contributors:
 * - Add new variants in the buttonVariants object
 * - Modify colors to match brand guidelines
 * - Add loading state with spinner
 * - Implement button groups
 * - Add icon support with left/right positioning
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button variant configuration using class-variance-authority
 * 
 * Base classes apply to all buttons, then variant-specific
 * classes are added based on the variant and size props.
 */
const buttonVariants = cva(
  // Base classes for all buttons
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 text-gray-900',
        link: 'text-brand-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Button component props
 * 
 * Extends standard HTML button attributes with variant props
 * @property variant - Visual style variant
 * @property size - Button size preset
 * @property asChild - Whether to render as child component (for composition)
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Button Component
 * 
 * Forward ref component for proper ref handling in forms
 * and other use cases requiring direct DOM access.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
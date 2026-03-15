import { type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const pageContainerVariants = cva(
  'w-full px-page lg:px-page-lg',
  {
    variants: {
      variant: {
        default: 'max-w-3xl',
        wide: 'max-w-6xl',
        narrow: 'max-w-2xl',
      },
      align: {
        center: 'mx-auto',
        left: 'mx-auto lg:mx-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      align: 'center',
    },
  }
)

interface PageContainerProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof pageContainerVariants> {
  children: ReactNode
}

export function PageContainer({ children, variant, align, className, ...props }: PageContainerProps) {
  return (
    <div className={cn(pageContainerVariants({ variant, align }), className)} {...props}>
      {children}
    </div>
  )
}

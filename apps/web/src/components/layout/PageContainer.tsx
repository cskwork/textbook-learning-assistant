import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const pageContainerVariants = cva(
  'mx-auto w-full px-page lg:px-page-lg',
  {
    variants: {
      variant: {
        default: 'max-w-3xl',
        wide: 'max-w-6xl',
        narrow: 'max-w-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface PageContainerProps extends VariantProps<typeof pageContainerVariants> {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, variant, className }: PageContainerProps) {
  return (
    <div className={cn(pageContainerVariants({ variant }), className)}>
      {children}
    </div>
  )
}

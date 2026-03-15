import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  layoutId?: string;
}

export function GlassCard({ children, className, onClick, layoutId, ...rest }: GlassCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      className={cn(
        'rounded-xl bg-card/90 border border-border transition-all duration-200',
        onClick && 'cursor-pointer',
        className,
      )}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

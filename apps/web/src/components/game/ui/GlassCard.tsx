import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  layoutId?: string;
}

export function GlassCard({ children, className = '', onClick, layoutId, ...rest }: GlassCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      className={`
        rounded-xl
        border border-[var(--fun-glass-border)]
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: 'var(--fun-glass-bg)',
        backdropFilter: `blur(var(--fun-glass-blur))`,
        WebkitBackdropFilter: `blur(var(--fun-glass-blur))`,
      }}
      whileHover={onClick ? { scale: 1.01, background: 'var(--fun-bg-card-hover)' } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

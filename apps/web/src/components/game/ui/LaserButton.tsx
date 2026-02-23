import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

type LaserVariant = 'primary' | 'danger' | 'gold';
type LaserSize = 'sm' | 'md' | 'lg';

interface LaserButtonProps {
  children: ReactNode;
  variant?: LaserVariant;
  size?: LaserSize;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const variantColors: Record<LaserVariant, { neon: string; rgb: string }> = {
  primary: { neon: 'var(--fun-neon-cyan)', rgb: '0, 212, 255' },
  danger: { neon: 'var(--fun-neon-red)', rgb: '255, 51, 102' },
  gold: { neon: 'var(--fun-neon-gold)', rgb: '255, 215, 0' },
};

const sizeClasses: Record<LaserSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export function LaserButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
}: LaserButtonProps) {
  const { neon, rgb } = variantColors[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg font-semibold
        border border-[var(--fun-glass-border)]
        text-[var(--fun-text-primary)]
        transition-all duration-200
        ${sizeClasses[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        background: 'var(--fun-glass-bg)',
      }}
      whileHover={
        disabled
          ? undefined
          : {
              borderColor: neon,
              boxShadow: `0 0 10px rgba(${rgb}, 0.4), 0 0 20px rgba(${rgb}, 0.15)`,
            }
      }
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {/* Laser scan overlay on hover */}
      {!disabled && (
        <span
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(${rgb}, 0.15) 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'laser-scan 1.5s ease-in-out',
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

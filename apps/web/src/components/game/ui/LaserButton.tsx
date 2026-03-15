import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

type LaserVariant = 'primary' | 'danger' | 'gold';
type LaserSize = 'sm' | 'md' | 'lg' | 'kid';

interface LaserButtonProps {
  children: ReactNode;
  variant?: LaserVariant;
  size?: LaserSize;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const variantColors: Record<LaserVariant, { neon: string; rgb: string }> = {
  primary: { neon: 'var(--fun-neon-green)', rgb: '80, 220, 130' },
  danger: { neon: 'var(--fun-neon-coral)', rgb: '220, 100, 80' },
  gold: { neon: 'var(--fun-neon-gold)', rgb: '220, 190, 50' },
};

const sizeClasses: Record<LaserSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
  kid: 'px-6 py-3 text-base font-semibold rounded-2xl',
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
        border border-border
        text-foreground
        transition-all duration-200
        ${sizeClasses[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        background: 'var(--card)',
      }}
      whileHover={
        disabled
          ? undefined
          : {
              borderColor: neon,
              boxShadow: `0 0 6px rgba(${rgb}, 0.24), 0 0 12px rgba(${rgb}, 0.09)`,
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

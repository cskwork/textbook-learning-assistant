import { type ReactNode } from 'react';

type NeonColor = 'cyan' | 'magenta' | 'gold';

interface NeonBorderProps {
  children: ReactNode;
  color?: NeonColor;
  animated?: boolean;
  className?: string;
}

const glowMap: Record<NeonColor, string> = {
  cyan: 'var(--fun-glow-cyan)',
  magenta: 'var(--fun-glow-magenta)',
  gold: 'var(--fun-glow-gold)',
};

const colorMap: Record<NeonColor, [string, string]> = {
  cyan: ['var(--fun-neon-cyan)', 'var(--fun-neon-magenta)'],
  magenta: ['var(--fun-neon-magenta)', 'var(--fun-neon-cyan)'],
  gold: ['var(--fun-neon-gold)', 'var(--fun-neon-cyan)'],
};

export function NeonBorder({ children, color = 'cyan', animated = true, className = '' }: NeonBorderProps) {
  const [from, to] = colorMap[color];

  return (
    <div
      className={`
        relative rounded-xl p-[1px]
        ${animated ? 'animate-border-glow' : ''}
        ${className}
      `}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: glowMap[color],
      }}
    >
      <div
        className="rounded-[11px] h-full w-full"
        style={{ background: 'var(--fun-bg-secondary)' }}
      >
        {children}
      </div>
    </div>
  );
}

import { type ReactNode } from 'react';

type NeonColor = 'green' | 'magenta' | 'gold' | 'coral';

interface NeonBorderProps {
  children: ReactNode;
  color?: NeonColor;
  animated?: boolean;
  subtle?: boolean;
  className?: string;
}

const glowMap: Record<NeonColor, string> = {
  green: '0 0 6px color-mix(in oklch, var(--fun-neon-green) 30%, transparent)',
  magenta: '0 0 6px color-mix(in oklch, var(--fun-neon-magenta) 30%, transparent)',
  gold: '0 0 6px color-mix(in oklch, var(--fun-neon-gold) 30%, transparent)',
  coral: '0 0 6px color-mix(in oklch, var(--fun-neon-coral) 30%, transparent)',
};

const colorMap: Record<NeonColor, [string, string]> = {
  green: ['var(--fun-neon-green)', 'var(--fun-neon-magenta)'],
  magenta: ['var(--fun-neon-magenta)', 'var(--fun-neon-green)'],
  gold: ['var(--fun-neon-gold)', 'var(--fun-neon-green)'],
  coral: ['var(--fun-neon-coral)', 'var(--fun-neon-gold)'],
};

export function NeonBorder({ children, color = 'green', animated = true, subtle = false, className = '' }: NeonBorderProps) {
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
        boxShadow: subtle ? 'none' : glowMap[color],
      }}
    >
      <div
        className="rounded-[11px] h-full w-full"
        style={{ background: 'var(--card)' }}
      >
        {children}
      </div>
    </div>
  );
}

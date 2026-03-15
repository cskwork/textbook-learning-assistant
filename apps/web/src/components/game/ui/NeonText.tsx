import { type ReactNode, createElement } from 'react';

type NeonColor = 'magenta' | 'gold' | 'green' | 'coral';
type GlowIntensity = 'low' | 'medium' | 'high';
type TextElement = 'h1' | 'h2' | 'h3' | 'p' | 'span';

interface NeonTextProps {
  children: ReactNode;
  color?: NeonColor;
  as?: TextElement;
  glow?: GlowIntensity;
  className?: string;
}

const colorValues: Record<NeonColor, string> = {
  magenta: 'var(--fun-neon-magenta)',
  gold: 'var(--fun-neon-gold)',
  green: 'var(--fun-neon-green)',
  coral: 'var(--fun-neon-coral)',
};

const rgbaMap: Record<NeonColor, string> = {
  magenta: '180, 80, 255',
  gold: '220, 190, 50',
  green: '80, 220, 130',
  coral: '220, 100, 80',
};

function buildTextShadow(color: NeonColor, intensity: GlowIntensity): string {
  const rgb = rgbaMap[color];
  const layers: string[] = [];

  layers.push(`0 0 6px rgba(${rgb}, 0.3)`);

  if (intensity === 'medium' || intensity === 'high') {
    layers.push(`0 0 12px rgba(${rgb}, 0.18)`);
  }

  if (intensity === 'high') {
    layers.push(`0 0 24px rgba(${rgb}, 0.12)`);
  }

  return layers.join(', ');
}

export function NeonText({
  children,
  color = 'green',
  as = 'span',
  glow = 'low',
  className = '',
}: NeonTextProps) {
  return createElement(
    as,
    {
      className: `animate-neon-pulse ${className}`,
      style: {
        color: colorValues[color],
        textShadow: buildTextShadow(color, glow),
      },
    },
    children,
  );
}

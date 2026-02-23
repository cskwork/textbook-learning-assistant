import { type ReactNode, createElement } from 'react';

type NeonColor = 'cyan' | 'magenta' | 'gold' | 'green' | 'red';
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
  cyan: 'var(--fun-neon-cyan)',
  magenta: 'var(--fun-neon-magenta)',
  gold: 'var(--fun-neon-gold)',
  green: 'var(--fun-neon-green)',
  red: 'var(--fun-neon-red)',
};

const rgbaMap: Record<NeonColor, string> = {
  cyan: '0, 212, 255',
  magenta: '255, 0, 255',
  gold: '255, 215, 0',
  green: '0, 255, 136',
  red: '255, 51, 102',
};

function buildTextShadow(color: NeonColor, intensity: GlowIntensity): string {
  const rgb = rgbaMap[color];
  const layers: string[] = [];

  // low: 1 layer
  layers.push(`0 0 10px rgba(${rgb}, 0.5)`);

  if (intensity === 'medium' || intensity === 'high') {
    layers.push(`0 0 20px rgba(${rgb}, 0.3)`);
  }

  if (intensity === 'high') {
    layers.push(`0 0 40px rgba(${rgb}, 0.2)`);
  }

  return layers.join(', ');
}

export function NeonText({
  children,
  color = 'cyan',
  as = 'span',
  glow = 'medium',
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

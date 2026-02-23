interface GameIconProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

export function GemIcon({ size = 24, color = 'currentColor', className = '', glow = false }: GameIconProps) {
  const filterId = 'gem-glow';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={glow ? { filter: `url(#${filterId})` } : undefined}
    >
      {glow && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      {/* Gem top facet */}
      <polygon points="12,2 4,8 12,22 20,8" />
      {/* Top edge */}
      <line x1="4" y1="8" x2="20" y2="8" />
      {/* Inner facet lines */}
      <line x1="8" y1="2.5" x2="7" y2="8" />
      <line x1="16" y1="2.5" x2="17" y2="8" />
      <line x1="7" y1="8" x2="12" y2="22" />
      <line x1="17" y1="8" x2="12" y2="22" />
      {/* Center facet line */}
      <line x1="12" y1="2" x2="12" y2="8" />
    </svg>
  );
}

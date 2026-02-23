interface GameIconProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

export function CrownIcon({ size = 24, color = 'currentColor', className = '', glow = false }: GameIconProps) {
  const filterId = 'crown-glow';
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
      {/* Crown body */}
      <path d="M2 17L4 7L8.5 11L12 4L15.5 11L20 7L22 17H2Z" />
      {/* Crown base band */}
      <rect x="2" y="17" width="20" height="3" rx="1" />
      {/* Jewel dots */}
      <circle cx="7" cy="15" r="0.8" />
      <circle cx="12" cy="14" r="0.8" />
      <circle cx="17" cy="15" r="0.8" />
    </svg>
  );
}

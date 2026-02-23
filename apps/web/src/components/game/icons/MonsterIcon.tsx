interface GameIconProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

export function MonsterIcon({ size = 24, color = 'currentColor', className = '', glow = false }: GameIconProps) {
  const filterId = 'monster-glow';
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
      {/* Monster body */}
      <path d="M4 20V12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12V20" />
      {/* Horns */}
      <path d="M7 4L5 1" />
      <path d="M17 4L19 1" />
      {/* Eyes */}
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      {/* Mouth with fangs */}
      <path d="M8 16.5C8 16.5 9.5 18 12 18C14.5 18 16 16.5 16 16.5" />
      <line x1="9.5" y1="16" x2="10" y2="17.5" />
      <line x1="14.5" y1="16" x2="14" y2="17.5" />
      {/* Feet */}
      <line x1="7" y1="20" x2="7" y2="22" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="17" y1="20" x2="17" y2="22" />
    </svg>
  );
}

interface GameIconProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

export function FlameIcon({ size = 24, color = 'currentColor', className = '', glow = false }: GameIconProps) {
  const filterId = 'flame-glow';
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
      {/* Outer flame */}
      <path d="M12 2C12 2 7 8 7 13C7 16.87 9.24 20 12 22C14.76 20 17 16.87 17 13C17 8 12 2 12 2Z" />
      {/* Inner flame */}
      <path d="M12 8C12 8 9.5 11.5 9.5 14C9.5 16 10.62 17.5 12 18.5C13.38 17.5 14.5 16 14.5 14C14.5 11.5 12 8 12 8Z" />
      {/* Core highlight */}
      <path d="M12 13C12 13 11 14.5 11 15.5C11 16.33 11.45 17 12 17.3" />
    </svg>
  );
}

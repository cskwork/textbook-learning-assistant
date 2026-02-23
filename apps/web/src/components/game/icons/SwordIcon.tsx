interface GameIconProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

export function SwordIcon({ size = 24, color = 'currentColor', className = '', glow = false }: GameIconProps) {
  const filterId = 'sword-glow';
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
      {/* Blade */}
      <path d="M14.5 3L20.5 9L11 18.5L5.5 13L14.5 3Z" />
      {/* Fuller line */}
      <line x1="12.5" y1="6" x2="8" y2="15" />
      {/* Guard */}
      <path d="M4 15.5L8.5 11L13 15.5" />
      {/* Grip */}
      <line x1="5.5" y1="17" x2="3.5" y2="19" />
      {/* Pommel */}
      <circle cx="3" cy="19.5" r="1" />
    </svg>
  );
}

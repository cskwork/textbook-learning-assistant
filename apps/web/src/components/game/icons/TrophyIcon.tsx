interface GameIconProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

export function TrophyIcon({ size = 24, color = 'currentColor', className = '', glow = false }: GameIconProps) {
  const filterId = 'trophy-glow';
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
      {/* Cup body */}
      <path d="M6 3H18V8C18 11.31 15.31 14 12 14C8.69 14 6 11.31 6 8V3Z" />
      {/* Left handle */}
      <path d="M6 5H4C3 5 2 6 2 7.5C2 9 3 10 4 10H6" />
      {/* Right handle */}
      <path d="M18 5H20C21 5 22 6 22 7.5C22 9 21 10 20 10H18" />
      {/* Stem */}
      <line x1="12" y1="14" x2="12" y2="18" />
      {/* Base */}
      <path d="M8 21H16L15 18H9L8 21Z" />
      {/* Star decoration on cup */}
      <path d="M12 6L12.9 8H14.5L13.3 9.2L13.7 11L12 10L10.3 11L10.7 9.2L9.5 8H11.1L12 6Z" />
    </svg>
  );
}

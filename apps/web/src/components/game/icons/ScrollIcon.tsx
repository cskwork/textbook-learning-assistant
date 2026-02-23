interface GameIconProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

export function ScrollIcon({ size = 24, color = 'currentColor', className = '', glow = false }: GameIconProps) {
  const filterId = 'scroll-glow';
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
      {/* Scroll body */}
      <path d="M8 3C6.5 3 5 4 5 5.5V18.5C5 20 6.5 21 8 21H18C18 21 19 21 19 19.5V5.5C19 4 18 3 16.5 3H8Z" />
      {/* Top curl */}
      <path d="M5 5.5C5 4 6.5 3 8 3C6.5 3 5 4.5 5 5.5C5 6.5 6 7 7 7H19" />
      {/* Bottom curl */}
      <path d="M19 19.5C19 21 18 21 18 21C19.5 21 21 20 21 18.5V6C21 6 21 7 19 7" />
      {/* Text lines */}
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

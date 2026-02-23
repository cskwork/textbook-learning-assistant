interface GameIconProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

export function SkullIcon({ size = 24, color = 'currentColor', className = '', glow = false }: GameIconProps) {
  const filterId = 'skull-glow';
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
      {/* Skull cranium */}
      <path d="M12 2C7 2 4 5.5 4 9.5C4 12.5 5.5 14.5 6 15.5V18C6 18.5 6.5 19 7 19H17C17.5 19 18 18.5 18 18V15.5C18.5 14.5 20 12.5 20 9.5C20 5.5 17 2 12 2Z" />
      {/* Left eye socket */}
      <circle cx="9" cy="10" r="2" />
      {/* Right eye socket */}
      <circle cx="15" cy="10" r="2" />
      {/* Nose */}
      <path d="M11 14L12 15L13 14" />
      {/* Jaw teeth */}
      <line x1="8" y1="19" x2="8" y2="21.5" />
      <line x1="10.5" y1="19" x2="10.5" y2="22" />
      <line x1="13.5" y1="19" x2="13.5" y2="22" />
      <line x1="16" y1="19" x2="16" y2="21.5" />
    </svg>
  );
}

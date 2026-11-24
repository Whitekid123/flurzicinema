import type { CSSProperties } from "react";
export function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m8 5 12 7-12 7z" />
    </svg>
  );
}
export function Reel({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="3" />
      <circle cx="100" cy="100" r="11" stroke="currentColor" strokeWidth="2" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="100"
          cy="49"
          rx="21"
          ry="25"
          stroke="currentColor"
          strokeWidth="1.5"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
    </svg>
  );
}

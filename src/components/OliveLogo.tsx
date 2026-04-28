export default function OliveLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className}>
      <g transform="translate(150 150)">
        <g fill="var(--primary)" stroke="#1A1A1A" strokeWidth="10" strokeLinejoin="round">
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z"/>
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(60)"/>
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(120)"/>
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(180)"/>
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(240)"/>
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(300)"/>
        </g>
        <ellipse cx="0" cy="0" rx="13" ry="17" fill="#2B1F3A" stroke="#1A1A1A" strokeWidth="6"/>
      </g>
    </svg>
  );
}

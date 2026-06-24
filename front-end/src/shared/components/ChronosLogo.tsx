export function ChronosLogo({ size = 34 }: { size?: number }) {
  const r = 15;
  const cx = 20;
  const cy = 20;
  const circ = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="#60b8ff"
        strokeWidth="2"
        strokeDasharray={`${circ * 0.78} ${circ * 0.22}`}
        strokeDashoffset={`${circ * 0.055}`}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx + 8 * Math.sin((-30 * Math.PI) / 180)}
        y2={cy - 8 * Math.cos((-30 * Math.PI) / 180)}
        stroke="#60b8ff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx + 11 * Math.sin((60 * Math.PI) / 180)}
        y2={cy - 11 * Math.cos((60 * Math.PI) / 180)}
        stroke="#60b8ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.65"
      />
      <circle cx={cx} cy={cy} r="2.5" fill="#60b8ff" />
      <line x1={cx} y1={cy - r + 2.5} x2={cx} y2={cy - r + 5.5} stroke="#60b8ff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1={cx + r - 2.5} y1={cy} x2={cx + r - 5.5} y2={cy} stroke="#60b8ff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1={cx - r + 2.5} y1={cy} x2={cx - r + 5.5} y2={cy} stroke="#60b8ff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

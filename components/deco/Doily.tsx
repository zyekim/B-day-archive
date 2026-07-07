/**
 * 레이스 도일리 페이퍼 (SVG). 보드 타이틀 뒤 배경 장식.
 */
export default function Doily({
  size = 220,
  color = "#FFFDF7",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const scallops = 24;
  const cx = 100;
  const cy = 100;
  const rOuter = 96;
  const points = Array.from({ length: scallops }, (_, i) => {
    const a = (i / scallops) * Math.PI * 2;
    return `${cx + Math.cos(a) * rOuter},${cy + Math.sin(a) * rOuter}`;
  });
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      {points.map((p, i) => {
        const [x, y] = p.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="12" fill={color} opacity="0.9" />;
      })}
      <circle cx={cx} cy={cy} r="82" fill={color} opacity="0.92" />
      <circle cx={cx} cy={cy} r="70" fill="none" stroke="#E9DFC8" strokeWidth="2" strokeDasharray="2 5" />
      <circle cx={cx} cy={cy} r="52" fill="none" stroke="#E9DFC8" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx={cx} cy={cy} r="34" fill="none" stroke="#E9DFC8" strokeWidth="2" strokeDasharray="2 6" />
    </svg>
  );
}

import { seededPick } from "@/lib/seed-rotation";

const CLIP_COLORS = ["#E8A0B0", "#9CC6B4", "#F2C879", "#A9C1E0", "#D88C9A"];

/**
 * 빈티지 바인딩 클립 (penco Clampy 느낌) — SVG. 파스텔 컬러.
 * 이미지 에셋이 없어 SVG로 구현.
 */
export default function Clip({
  seed = "",
  width = 34,
  color,
  className = "",
}: {
  seed?: string;
  width?: number;
  color?: string;
  className?: string;
}) {
  const c = color ?? seededPick(seed, CLIP_COLORS, "clip");
  return (
    <svg
      viewBox="0 0 40 64"
      width={width}
      height={(width * 64) / 40}
      aria-hidden="true"
      className={`pointer-events-none select-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] ${className}`}
    >
      <rect x="9" y="4" width="22" height="40" rx="7" fill="none" stroke={c} strokeWidth="4" />
      <rect x="14" y="4" width="12" height="34" rx="5" fill="none" stroke={c} strokeWidth="3" />
      <rect x="6" y="30" width="28" height="30" rx="6" fill={c} />
      <rect x="6" y="30" width="28" height="8" rx="4" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

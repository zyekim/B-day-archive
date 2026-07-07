import { PATCHES } from "@/lib/deco";
import { seededPick, seededTilt } from "@/lib/seed-rotation";

/**
 * 자수 와펜 패치 스티커 — 이미지 에셋 Patch 1~18.
 * 장식 전용: 클릭 불가, aria-hidden.
 */
export default function Patch({
  seed = "",
  size = 64,
  src,
  className = "",
  style,
}: {
  seed?: string;
  size?: number;
  src?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const img = src ?? seededPick(seed, PATCHES, "patch");
  const tilt = seededTilt(seed + ":patch", 12);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${className}`}
      style={{ width: size, height: "auto", transform: `rotate(${tilt}deg)`, ...style }}
    />
  );
}

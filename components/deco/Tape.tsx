import { TAPE } from "@/lib/deco";

/** 마스킹테이프 (크림색) — 이미지 에셋 pin3. 살짝 기울여 붙임. */
export default function Tape({
  size = 78,
  rotate = -6,
  src,
  className = "",
}: {
  size?: number;
  rotate?: number;
  src?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? TAPE}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none select-none opacity-95 ${className}`}
      style={{ width: size, height: "auto", transform: `rotate(${rotate}deg)` }}
    />
  );
}

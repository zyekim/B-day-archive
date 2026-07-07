import { BOWS } from "@/lib/deco";
import { seededPick } from "@/lib/seed-rotation";

/** 깅엄체크 리본 (레드/그린) — 이미지 에셋 pin1/pin2 */
export default function Bow({
  seed = "",
  size = 54,
  src,
  className = "",
}: {
  seed?: string;
  size?: number;
  src?: string;
  className?: string;
}) {
  const img = src ?? seededPick(seed, BOWS, "bow");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none select-none drop-shadow-[0_3px_5px_rgba(0,0,0,0.25)] ${className}`}
      style={{ width: size, height: "auto" }}
    />
  );
}

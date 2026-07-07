import { PUSHPINS } from "@/lib/deco";
import { seededPick } from "@/lib/seed-rotation";

/**
 * 푸시핀 — 이미지 에셋(pin4/pin5) 사용. 아이템 상단 중앙에 겹쳐 꽂는 용도.
 * src prop으로 다른 이미지 교체 가능.
 */
export default function Pin({
  seed = "",
  size = 30,
  src,
  className = "",
}: {
  seed?: string;
  size?: number;
  src?: string;
  className?: string;
}) {
  const img = src ?? seededPick(seed, PUSHPINS, "pin");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none select-none drop-shadow-[0_3px_4px_rgba(0,0,0,0.3)] ${className}`}
      style={{ width: size, height: "auto" }}
    />
  );
}

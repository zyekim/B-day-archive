import Patch from "./Patch";
import { seededInt, seededUnit } from "@/lib/seed-rotation";

/**
 * 보드 빈 공간에 자수 패치를 시드 기반으로 흩뿌리는 장식 레이어.
 * 전부 aria-hidden, pointer-events none. 모바일에선 count를 줄여 호출.
 */
export default function PatchScatter({
  seed = "board",
  count = 6,
}: {
  seed?: string;
  count?: number;
}) {
  const items = Array.from({ length: count }, (_, i) => {
    const s = `${seed}:${i}`;
    return {
      left: 4 + seededUnit(s + "x") * 88,
      top: 6 + seededUnit(s + "y") * 84,
      size: seededInt(s, 44, 74, "sz"),
      seed: s,
    };
  });
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${it.left}%`, top: `${it.top}%` }}
        >
          <Patch seed={it.seed} size={it.size} />
        </div>
      ))}
    </div>
  );
}

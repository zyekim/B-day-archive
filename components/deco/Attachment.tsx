import Pin from "./Pin";
import Bow from "./Bow";
import Tape from "./Tape";
import { ATTACH_KINDS } from "@/lib/deco";
import { seededPick } from "@/lib/seed-rotation";

/**
 * 보드 아이템 상단에 랜덤으로 하나 부착 (푸시핀/리본/마스킹테이프).
 * 종류는 seed로 고정. 아이템 상단 중앙에 절대배치되도록 감싼다.
 */
export default function Attachment({ seed }: { seed: string }) {
  const kind = seededPick(seed, ATTACH_KINDS, "attach");
  return (
    <span className="absolute left-1/2 -top-3 z-20 -translate-x-1/2">
      {kind === "pushpin" && <Pin seed={seed} size={28} />}
      {kind === "bow" && <Bow seed={seed} size={50} className="-mt-1" />}
      {kind === "tape" && <Tape size={72} rotate={seededPick(seed, [-7, 5, -4, 8], "tp") as number} />}
    </span>
  );
}

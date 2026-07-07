import Image from "next/image";
import Attachment from "@/components/deco/Attachment";
import Timestamp from "./Timestamp";
import { seededTilt } from "@/lib/seed-rotation";
import type { Photo } from "@/lib/types";

/**
 * 인생네컷 스타일 세로 4컷 검정 스트립. 사진 4장으로 구성.
 */
export default function PhotoStrip({
  id,
  photos,
  width = 130,
}: {
  id: string;
  photos: Photo[];
  width?: number;
}) {
  const four = photos.slice(0, 4);
  if (four.length < 4) return null;
  const tilt = seededTilt(id + ":strip", 3);
  const cell = width - 20;
  return (
    <div
      className="relative inline-block bg-[#151515] p-2.5 pb-8 shadow-polaroid"
      style={{ transform: `rotate(${tilt}deg)`, width }}
    >
      <Attachment seed={id + ":strip"} />
      <div className="flex flex-col gap-1.5">
        {four.map((p, i) => (
          <div
            key={p.id}
            className="relative overflow-hidden bg-[#2a2a2a]"
            style={{ width: cell, height: cell * 0.72 }}
          >
            <Image src={p.image_url} alt={p.caption || "네컷"} fill sizes={`${width}px`} className="object-cover" />
            {i === 3 && (
              <span className="pointer-events-none absolute bottom-1 right-1">
                <Timestamp date={p.taken_date} />
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-center font-pixel text-[9px] tracking-widest text-white/90">
        4CUT MEMORIES
      </p>
    </div>
  );
}

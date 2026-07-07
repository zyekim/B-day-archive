import Image from "next/image";
import Timestamp from "./Timestamp";
import Attachment from "@/components/deco/Attachment";
import LikeButton from "./LikeButton";
import { seededTilt } from "@/lib/seed-rotation";

/**
 * 폴라로이드 카드 — 하단 여백 넓은 프레임 + id 시드 기울기(-3~3°) 고정.
 * 상단에 랜덤 부착물(핀/리본/테이프), 우하단 디카 타임스탬프, 하단 손글씨 캡션.
 */
export default function Polaroid({
  id,
  imageUrl,
  caption,
  takenDate,
  boardName,
  likeCount = 0,
  liked = false,
  showLike = true,
  width = 200,
  priority = false,
}: {
  id: string;
  imageUrl: string;
  caption?: string | null;
  takenDate?: string | null;
  boardName?: string;
  likeCount?: number;
  liked?: boolean;
  showLike?: boolean;
  width?: number;
  priority?: boolean;
}) {
  const tilt = seededTilt(id, 3);
  return (
    <figure
      className="group relative inline-block bg-polaroid p-2.5 pb-9 shadow-polaroid motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-0"
      style={{ transform: `rotate(${tilt}deg)`, width }}
    >
      <Attachment seed={id} />
      <div
        className="relative overflow-hidden bg-[#c2ad8c]"
        style={{ width: width - 20, height: width - 20 }}
      >
        <Image
          src={imageUrl}
          alt={caption || "추억 사진"}
          fill
          sizes={`${width}px`}
          className="object-cover"
          priority={priority}
        />
        <span className="pointer-events-none absolute bottom-1.5 right-1.5">
          <Timestamp date={takenDate ?? null} />
        </span>
      </div>

      {showLike && boardName && (
        <div className="absolute -right-2 -top-2 z-30">
          <LikeButton photoId={id} boardName={boardName} initialCount={likeCount} initialLiked={liked} />
        </div>
      )}

      {caption ? (
        <figcaption className="mt-2 text-center font-hand text-[19px] leading-tight text-ink">
          {caption}
        </figcaption>
      ) : (
        <figcaption className="mt-2 h-4" aria-hidden="true" />
      )}
    </figure>
  );
}

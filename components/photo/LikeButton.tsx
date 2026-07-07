"use client";

import { useState } from "react";
import { createAnonClient } from "@/lib/supabase";

/**
 * 하트 스티커 좋아요. 보드당 사진 1회(도장). unique(friend_name, photo_id)로 중복 방지.
 * 삭제 정책이 없어 add-only(한번 찍으면 유지). 클릭 시 도장 애니메이션.
 */
export default function LikeButton({
  photoId,
  boardName,
  initialCount = 0,
  initialLiked = false,
}: {
  photoId: string;
  boardName: string;
  initialCount?: number;
  initialLiked?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [justStamped, setJustStamped] = useState(false);

  async function like() {
    if (liked || busy) return;
    setBusy(true);
    try {
      const supabase = createAnonClient();
      const { error } = await supabase
        .from("board_likes")
        .upsert(
          { friend_name: boardName.trim().toLowerCase(), photo_id: photoId },
          { onConflict: "friend_name,photo_id", ignoreDuplicates: true }
        );
      if (!error) {
        setLiked(true);
        setCount((c) => c + 1);
        setJustStamped(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={like}
      disabled={liked || busy}
      aria-label={liked ? "좋아요 완료" : "좋아요"}
      aria-pressed={liked}
      className="relative grid h-9 w-9 place-items-center rounded-full bg-polaroid shadow-pin outline-none transition focus-visible:ring-2 focus-visible:ring-stamp-orange disabled:cursor-default"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 21s-7.5-4.7-10-9.3C.4 8.4 2 4.8 5.4 4.8c2 0 3.3 1.2 4.1 2.5C10.3 6 11.6 4.8 13.6 4.8c3.4 0 5 3.6 3.4 6.9C19.5 16.3 12 21 12 21z"
          fill={liked ? "#E4312B" : "none"}
          stroke="#E4312B"
          strokeWidth="1.8"
          className={justStamped ? "motion-safe:animate-stamp" : ""}
        />
      </svg>
      {count > 0 && (
        <span className="pointer-events-none absolute -bottom-1 -right-1 rounded-full bg-stamp-orange px-1 text-[10px] font-bold leading-4 text-white">
          {count}
        </span>
      )}
    </button>
  );
}

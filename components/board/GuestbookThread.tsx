"use client";

import { useState } from "react";
import { createAnonClient } from "@/lib/supabase";
import { seededTilt, seededPick } from "@/lib/seed-rotation";
import type { Comment } from "@/lib/types";

const NOTE_BG = ["#FFF7C2", "#FDE1E8", "#DFF3E8", "#E4EEFB", "#FFFDF7"];

function NoteCard({ c }: { c: Comment }) {
  const tilt = seededTilt(c.id, 2.5);
  const bg = seededPick(c.id, NOTE_BG, "note");
  return (
    <li
      className="relative w-full max-w-[260px] px-4 pb-4 pt-5 shadow-polaroid"
      style={{
        transform: `rotate(${tilt}deg)`,
        backgroundColor: bg,
        backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #9FB4D8 24px)",
      }}
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-[-4deg] border border-[#d2b45a]/40 bg-[rgba(255,253,247,0.72)]"
      />
      <p className="whitespace-pre-wrap break-words font-hand text-[20px] leading-6 text-ink">{c.message}</p>
      <p className="mt-2 text-right font-hand text-[17px] text-album-navy">— {c.author_name}</p>
    </li>
  );
}

export default function GuestbookThread({
  boardName,
  initialComments,
}: {
  boardName: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !message.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createAnonClient();
      const payload = {
        friend_name: boardName.trim().toLowerCase(),
        author_name: author.trim(),
        message: message.trim(),
      };
      const { data, error } = await supabase.from("comments").insert(payload).select().single();
      if (error) {
        setError("쪽지 남기기에 실패했어요. 잠시 후 다시 시도해주세요.");
      } else if (data) {
        setComments((prev) => [data as Comment, ...prev]);
        setMessage("");
      }
    } catch {
      setError("Supabase 연결을 확인해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="mx-auto mb-6 w-full max-w-[320px] bg-polaroid p-4 shadow-polaroid"
        style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #9FB4D8 24px)" }}
      >
        <p className="mb-2 font-pixel text-[11px] text-album-navy">방명록 쪽지 남기기</p>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="이름"
          maxLength={20}
          className="mb-2 w-full rounded-sm border border-paper-line bg-white/70 px-2 py-1 font-hand text-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-stamp-orange"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="축하 메시지를 남겨주세요"
          rows={3}
          maxLength={300}
          className="w-full resize-none rounded-sm border border-paper-line bg-white/70 px-2 py-1 font-hand text-lg leading-6 text-ink outline-none focus-visible:ring-2 focus-visible:ring-stamp-orange"
        />
        {error && <p className="mt-1 font-body text-xs text-[#c0392b]">{error}</p>}
        <button
          type="submit"
          disabled={busy || !author.trim() || !message.trim()}
          className="mt-2 w-full rounded-sm bg-album-navy py-2 font-pixel text-[11px] text-white transition hover:bg-album-navy/90 focus-visible:ring-2 focus-visible:ring-stamp-orange disabled:opacity-50"
        >
          {busy ? "붙이는 중..." : "쪽지 붙이기"}
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="text-center font-hand text-xl text-ink/70">아직 쪽지가 없어요. 첫 쪽지를 남겨주세요!</p>
      ) : (
        <ul className="flex flex-wrap items-start justify-center gap-5">
          {comments.map((c) => (
            <NoteCard key={c.id} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

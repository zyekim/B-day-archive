"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAnonClient } from "@/lib/supabase";

/** 방명록 쪽지 작성 폼 (모달 안에서 사용) */
export default function NoteForm({
  boardName,
  onSuccess,
}: {
  boardName: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [refreshing, startTransition] = useTransition();

  // 저장 완료 + 보드 갱신 완료 → 그때 닫기 (화면에 실제로 나타난 뒤)
  useEffect(() => {
    if (saved && !refreshing) onSuccess?.();
  }, [saved, refreshing, onSuccess]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !message.trim() || busy || saved) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createAnonClient();
      const { error } = await supabase.from("comments").insert({
        friend_name: boardName.trim().toLowerCase(),
        author_name: author.trim(),
        message: message.trim(),
      });
      if (error) {
        setError("쪽지 남기기에 실패했어요. 잠시 후 다시 시도해주세요.");
      } else {
        setMessage("");
        setSaved(true);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setError("연결을 확인해주세요.");
    } finally {
      setBusy(false);
    }
  }

  const working = busy || saved;

  return (
    <form
      onSubmit={submit}
      className="w-full bg-polaroid p-4 shadow-polaroid"
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
        disabled={working || !author.trim() || !message.trim()}
        className="mt-2 w-full rounded-sm bg-album-navy py-2 font-pixel text-[11px] text-white transition hover:bg-album-navy/90 focus-visible:ring-2 focus-visible:ring-stamp-orange disabled:opacity-50"
      >
        {working ? (
          <span className="inline-flex items-center justify-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3 w-3 animate-spin rounded-full border-2 border-white/50 border-t-white"
            />
            {saved ? "보드에 붙이는 중..." : "저장하는 중..."}
          </span>
        ) : (
          "쪽지 붙이기"
        )}
      </button>
    </form>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createAnonClient } from "@/lib/supabase";

const MAX_BYTES = 5 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/**
 * 친구 본인 사진 업로드 → Supabase Storage(photos 버킷) + board_uploads insert.
 * 제한: 5MB, jpg/png/webp/heic.
 */
export default function UploadForm({ boardName }: { boardName: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || busy) return;
    if (!OK_TYPES.includes(file.type)) {
      setMsg("jpg / png / webp / heic 이미지만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMsg("파일이 너무 커요 (최대 5MB).");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const supabase = createAnonClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) {
        setMsg("업로드 실패: 저장소 권한을 확인해주세요.");
        return;
      }
      const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
      const { error: insErr } = await supabase.from("board_uploads").insert({
        friend_name: boardName.trim().toLowerCase(),
        image_url: pub.publicUrl,
        caption: caption.trim() || null,
      });
      if (insErr) {
        setMsg("사진 정보 저장에 실패했어요.");
        return;
      }
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      setMsg("붙였어요! 🎉");
      router.refresh();
    } catch {
      setMsg("Supabase 연결을 확인해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-[320px] bg-polaroid p-4 shadow-polaroid">
      <p className="mb-2 font-pixel text-[11px] text-album-navy">내 사진 붙이기</p>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="mb-2 w-full font-body text-xs text-ink file:mr-2 file:rounded-sm file:border-0 file:bg-album-navy file:px-2 file:py-1 file:text-white"
      />
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="한 줄 캡션 (선택)"
        maxLength={60}
        className="mb-2 w-full rounded-sm border border-paper-line bg-white/70 px-2 py-1 font-hand text-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-stamp-orange"
      />
      {msg && <p className="mb-1 font-body text-xs text-ink">{msg}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-sm bg-stamp-orange py-2 font-pixel text-[11px] text-white transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-album-navy disabled:opacity-50"
      >
        {busy ? "올리는 중..." : "사진 붙이기"}
      </button>
    </form>
  );
}

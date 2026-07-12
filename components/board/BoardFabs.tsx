"use client";

import { useState } from "react";
import UploadForm from "./UploadForm";
import NoteForm from "./NoteForm";

/**
 * 우측 하단 플로팅 버튼 (사진 추가 / 쪽지 남기기).
 * 누르면 모달로 폼이 떠서 보드를 가리지 않는다.
 */
export default function BoardFabs({ boardName }: { boardName: string }) {
  const [open, setOpen] = useState<null | "photo" | "note">(null);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setOpen("photo")}
          className="flex items-center gap-1.5 rounded-full bg-stamp-orange px-4 py-2.5 font-pixel text-[11px] text-white shadow-polaroid transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-album-navy"
        >
          <span aria-hidden="true">📷</span> 사진 추가
        </button>
        <button
          type="button"
          onClick={() => setOpen("note")}
          className="flex items-center gap-1.5 rounded-full bg-album-navy px-4 py-2.5 font-pixel text-[11px] text-white shadow-polaroid transition hover:bg-album-navy/90 focus-visible:ring-2 focus-visible:ring-stamp-orange"
        >
          <span aria-hidden="true">💌</span> 쪽지 남기기
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4"
          onClick={() => setOpen(null)}
        >
          <div className="relative w-full max-w-[340px]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="닫기"
              className="absolute -right-2 -top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-album-navy font-pixel text-[12px] text-white shadow-pin hover:bg-album-navy/90"
            >
              ✕
            </button>
            {open === "photo" ? (
              <UploadForm boardName={boardName} onSuccess={() => setOpen(null)} />
            ) : (
              <NoteForm boardName={boardName} onSuccess={() => setOpen(null)} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

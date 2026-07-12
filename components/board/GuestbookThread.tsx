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

/** 방명록 쪽지 목록 (작성은 우측 하단 쪽지 버튼 → 모달) */
export default function GuestbookThread({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-center font-hand text-xl text-ink/70">
        아직 쪽지가 없어요. 오른쪽 아래 💌 버튼으로 첫 쪽지를 남겨주세요!
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap items-start justify-center gap-5">
      {comments.map((c) => (
        <NoteCard key={c.id} c={c} />
      ))}
    </ul>
  );
}

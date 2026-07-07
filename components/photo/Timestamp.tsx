/**
 * 디카 스타일 주황 타임스탬프. 형식 '05 08 15 (YY MM DD).
 * text-shadow로 살짝 번지는 발광 효과.
 */
export default function Timestamp({
  date,
  className = "",
}: {
  date: string | null;
  className?: string;
}) {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return (
    <span
      className={`font-pixel text-[11px] tracking-widest text-stamp-orange ${className}`}
      style={{ textShadow: "0 0 4px rgba(255,107,0,0.85), 0 0 1px rgba(255,180,80,0.9)" }}
    >
      &apos;{yy} {mm} {dd}
    </span>
  );
}

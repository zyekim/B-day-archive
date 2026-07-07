/**
 * 영수증 스타일 보드 요약 통계.
 */
export default function Receipt({
  name,
  photoCount,
  likeCount,
  commentCount,
  className = "",
}: {
  name: string;
  photoCount: number;
  likeCount: number;
  commentCount: number;
  className?: string;
}) {
  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between font-pixel text-[10px] leading-6 text-ink">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
  return (
    <div
      className={`w-[150px] bg-polaroid px-4 py-3 shadow-polaroid ${className}`}
      style={{
        borderTop: "2px dashed #bbb",
        borderBottom: "2px dashed #bbb",
      }}
    >
      <div className="border-b border-dashed border-[#bbb] pb-2 text-center font-pixel text-[11px] tracking-widest text-album-navy">
        MEMORY RECEIPT
      </div>
      <div className="py-1 text-center font-hand text-lg text-ink">{name}</div>
      <div className="border-t border-dashed border-[#bbb] pt-1">
        <Row label="PHOTOS" value={photoCount} />
        <Row label="LIKES" value={likeCount} />
        <Row label="NOTES" value={commentCount} />
      </div>
      <div className="mt-1 flex justify-between border-t border-dashed border-[#bbb] pt-1 font-pixel text-[11px] font-bold text-stamp-orange">
        <span>TOTAL</span>
        <span>우정 ∞</span>
      </div>
      <div className="mt-2 text-center font-pixel text-[8px] tracking-[0.2em] text-ink/60">
        * THANK YOU *
      </div>
    </div>
  );
}

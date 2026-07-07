/**
 * "HELLO my name is" 빨간 네임태그. 이름은 손글씨 폰트.
 */
export default function NameTag({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div className={`inline-block w-max ${className}`}>
      <div className="rounded-t-[4px] bg-[#E4312B] px-3 py-1 text-center font-pixel text-[11px] tracking-wider text-white">
        HELLO my name is
      </div>
      <div className="rounded-b-[4px] border-2 border-t-0 border-[#E4312B] bg-polaroid px-5 pb-2 pt-1 text-center">
        <span className="font-hand text-4xl leading-none text-album-navy">{name}</span>
      </div>
    </div>
  );
}

import { BOARD_BG } from "@/lib/deco";

/**
 * 나무 프레임 코르크보드. board.svg 배경 + CSS 코르크 질감 + 나무 프레임.
 * children은 절대배치 콜라주 or 그리드로 채운다.
 */
export default function CorkBoard({
  children,
  className = "",
  minHeight = 520,
}: {
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}) {
  return (
    <div
      className={`relative rounded-[14px] border-[12px] border-wood-frame shadow-board ${className}`}
      style={{
        backgroundColor: "#C89F6E",
        backgroundImage:
          `url(${BOARD_BG}),` +
          "radial-gradient(#A87F52 8%, transparent 8%)," +
          "radial-gradient(#A87F52 6%, transparent 6%)," +
          "radial-gradient(#b58a5e 5%, transparent 5%)",
        backgroundSize: "cover, 14px 14px, 22px 22px, 30px 30px",
        backgroundPosition: "center, 0 0, 7px 11px, 15px 5px",
        backgroundRepeat: "no-repeat, repeat, repeat, repeat",
        minHeight,
      }}
    >
      {children}
    </div>
  );
}

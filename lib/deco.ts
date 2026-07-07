/**
 * 데코 에셋 매니페스트 (public/deco).
 * 파일명에 공백이 있어 encodeURI로 경로를 만든다.
 */

const enc = (name: string) => `/deco/${encodeURIComponent(name)}`;

/** 자수 와펜 패치 18종 */
export const PATCHES: string[] = Array.from({ length: 18 }, (_, i) =>
  enc(`Patch ${i + 1}.png`)
);

/** 푸시핀 (민트/핑크) — 아이템 상단 중앙에 꽂는 용도 */
export const PUSHPINS: string[] = [enc("pin4.png"), enc("pin5.png")];

/** 깅엄체크 리본 (레드/그린) */
export const BOWS: string[] = [enc("pin1.png"), enc("pin2.png")];

/** 마스킹테이프 (크림색) */
export const TAPE: string = enc("pin3.png");

/** 코르크보드 배경 */
export const BOARD_BG: string = "/deco/board.svg";

/** 아이템 상단 부착물 종류 */
export type AttachKind = "pushpin" | "bow" | "tape";
export const ATTACH_KINDS: AttachKind[] = ["pushpin", "bow", "tape", "pushpin"];

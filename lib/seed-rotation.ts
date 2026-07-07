/**
 * 시드 기반 결정론적 랜덤 — SSR/CSR 불일치 방지.
 * 같은 id는 항상 같은 기울기/핀/데코를 반환한다.
 */

/** 문자열 → 안정적인 32bit 해시 (djb2 변형) */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/** 0~1 사이 결정론적 값 */
export function seededUnit(seed: string): number {
  return (hashString(seed) % 100000) / 100000;
}

/** -maxDeg ~ +maxDeg 사이 기울기 (id 고정) */
export function seededTilt(id: string, maxDeg = 3): number {
  const unit = seededUnit(id + ":tilt");
  return Math.round((unit * 2 - 1) * maxDeg * 10) / 10;
}

/** 배열에서 시드 기반으로 하나 고르기 */
export function seededPick<T>(id: string, arr: readonly T[], salt = ""): T {
  const idx = hashString(id + ":" + salt) % arr.length;
  return arr[idx];
}

/** 시드 기반 정수 범위 [min, max] */
export function seededInt(id: string, min: number, max: number, salt = ""): number {
  const span = max - min + 1;
  return min + (hashString(id + ":" + salt) % span);
}

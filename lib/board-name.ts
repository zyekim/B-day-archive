import type { Board } from "./types";

type BoardNameFields = Pick<Board, "friend_name" | "display_name">;

export function normalizeName(name: string): string {
  return decodeURIComponent(name).trim().toLowerCase();
}

export function boardStorageName(board: BoardNameFields | null, rawName: string): string {
  return board?.friend_name?.trim().toLowerCase() || normalizeName(rawName);
}

export function boardLookupNames(board: BoardNameFields | null, rawName: string): string[] {
  const names = [
    boardStorageName(board, rawName),
    normalizeName(rawName),
    board?.display_name ? normalizeName(board.display_name) : "",
  ];

  return Array.from(new Set(names.filter(Boolean)));
}

import { createAnonClient } from "./supabase";
import { boardLookupNames, boardStorageName, normalizeName } from "./board-name";
import type { Photo, BoardUpload, Comment, BoardPhoto, Board } from "./types";

export type BoardData = {
  displayName: string;
  boardName: string;
  board: Board | null;
  photos: BoardPhoto[];
  uploads: BoardUpload[];
  comments: Comment[];
  likeCount: number;
  isEmpty: boolean;
};

/** 보드 주인(name)의 태그 사진 + 좋아요 + 업로드 + 방명록을 한번에 로드 */
export async function getBoardData(rawName: string): Promise<BoardData> {
  const name = normalizeName(rawName);
  const displayName = decodeURIComponent(rawName).trim();
  const supabase = createAnonClient();

  // 0) 등록된 보드 (어드민이 생성)
  const { data: boardRow, error: boardError } = await supabase
    .from("boards")
    .select("*")
    .ilike("friend_name", name)
    .maybeSingle();
  if (boardError) throw boardError;
  const board = (boardRow ?? null) as Board | null;
  const boardName = boardStorageName(board, rawName);
  const lookupNames = boardLookupNames(board, rawName);

  // 1) 태그된 사진 id
  const { data: tags, error: tagsError } = await supabase
    .from("photo_tags")
    .select("photo_id")
    .in("friend_name", lookupNames);
  if (tagsError) throw tagsError;

  const photoIds = Array.from(new Set((tags ?? []).map((t) => t.photo_id)));

  // 2) 사진 본문
  let photos: Photo[] = [];
  if (photoIds.length > 0) {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .in("id", photoIds)
      .order("taken_date", { ascending: true, nullsFirst: false });
    if (error) throw error;
    photos = (data ?? []) as Photo[];
  }

  // 3) 이 보드의 좋아요 (friend_name = 보드 주인)
  const { data: likes, error: likesError } = await supabase
    .from("board_likes")
    .select("photo_id")
    .in("friend_name", lookupNames);
  if (likesError) throw likesError;
  const likedSet = new Set((likes ?? []).map((l) => l.photo_id));

  const boardPhotos: BoardPhoto[] = photos.map((p) => ({
    ...p,
    likeCount: likedSet.has(p.id) ? 1 : 0,
  }));

  // 4) 친구가 올린 사진
  const { data: uploads, error: uploadsError } = await supabase
    .from("board_uploads")
    .select("*")
    .in("friend_name", lookupNames)
    .order("created_at", { ascending: false });
  if (uploadsError) throw uploadsError;

  // 5) 방명록
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .in("friend_name", lookupNames)
    .order("created_at", { ascending: false });
  if (commentsError) throw commentsError;

  const uploadsArr = (uploads ?? []) as BoardUpload[];
  const commentsArr = (comments ?? []) as Comment[];

  return {
    // 보드에 등록된 표시용 이름 우선
    displayName: board?.display_name ?? displayName,
    boardName,
    board,
    photos: boardPhotos,
    uploads: uploadsArr,
    comments: commentsArr,
    likeCount: likedSet.size,
    // 등록된 보드면 내용이 없어도 열어준다
    isEmpty:
      !board &&
      boardPhotos.length === 0 &&
      uploadsArr.length === 0 &&
      commentsArr.length === 0,
  };
}

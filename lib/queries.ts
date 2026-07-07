import { createAnonClient } from "./supabase";
import type { Photo, BoardUpload, Comment, BoardPhoto } from "./types";

export function normalizeName(name: string): string {
  return decodeURIComponent(name).trim().toLowerCase();
}

export type BoardData = {
  displayName: string;
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

  // 1) 태그된 사진 id
  const { data: tags } = await supabase
    .from("photo_tags")
    .select("photo_id")
    .ilike("friend_name", name);

  const photoIds = Array.from(new Set((tags ?? []).map((t) => t.photo_id)));

  // 2) 사진 본문
  let photos: Photo[] = [];
  if (photoIds.length > 0) {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .in("id", photoIds)
      .order("taken_date", { ascending: true, nullsFirst: false });
    photos = (data ?? []) as Photo[];
  }

  // 3) 이 보드의 좋아요 (friend_name = 보드 주인)
  const { data: likes } = await supabase
    .from("board_likes")
    .select("photo_id")
    .ilike("friend_name", name);
  const likedSet = new Set((likes ?? []).map((l) => l.photo_id));

  const boardPhotos: BoardPhoto[] = photos.map((p) => ({
    ...p,
    likeCount: likedSet.has(p.id) ? 1 : 0,
  }));

  // 4) 친구가 올린 사진
  const { data: uploads } = await supabase
    .from("board_uploads")
    .select("*")
    .ilike("friend_name", name)
    .order("created_at", { ascending: false });

  // 5) 방명록
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .ilike("friend_name", name)
    .order("created_at", { ascending: false });

  const uploadsArr = (uploads ?? []) as BoardUpload[];
  const commentsArr = (comments ?? []) as Comment[];

  return {
    displayName,
    photos: boardPhotos,
    uploads: uploadsArr,
    comments: commentsArr,
    likeCount: likedSet.size,
    isEmpty:
      boardPhotos.length === 0 && uploadsArr.length === 0 && commentsArr.length === 0,
  };
}

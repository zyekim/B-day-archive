export type Photo = {
  id: string;
  image_url: string;
  taken_date: string | null;
  caption: string | null;
  created_at: string;
};

export type PhotoTag = {
  id: string;
  photo_id: string;
  friend_name: string;
};

export type BoardLike = {
  id: string;
  friend_name: string;
  photo_id: string;
  created_at: string;
};

export type BoardUpload = {
  id: string;
  friend_name: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export type Comment = {
  id: string;
  friend_name: string;
  author_name: string;
  message: string;
  created_at: string;
};

/** 보드 페이지에서 쓰는 사진 + 좋아요 수 합본 */
export type BoardPhoto = Photo & { likeCount: number };

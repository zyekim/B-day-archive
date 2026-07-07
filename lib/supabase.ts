import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * anon 클라이언트 — 읽기 + anon 허용된 insert(좋아요/방명록/업로드)에 사용.
 * 브라우저/서버 양쪽에서 안전 (RLS로 보호됨).
 */
export function createAnonClient() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY를 넣어주세요."
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * service_role 클라이언트 — 서버 전용(어드민 서버 액션). 절대 클라이언트로 노출 금지.
 * RLS를 우회하므로 photos/photo_tags 쓰기·삭제에만 사용.
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY가 없습니다. .env.local에 서버 전용 키를 넣어주세요."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/** 환경변수 존재 여부 (설정 안내 화면 분기용) */
export const supabaseConfigured = Boolean(url && anonKey);

export const SUPABASE_URL = url;

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { createServiceClient } from "@/lib/supabase";

const COOKIE = "admin_session";

/* ---------- 비밀번호 해시 (scrypt, 형식: salt:hash hex) ---------- */

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(pw, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/**
 * 어드민 비밀 소스: DB(admin_config)의 해시.
 * DB 조회 실패(service key 미설정 등) 시 ADMIN_PASSWORD 환경변수로 폴백.
 * 반환: { dbHash } 또는 { envPw } 또는 null(어느 쪽도 없음)
 */
async function adminSecret(): Promise<{ dbHash?: string; envPw?: string } | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("admin_config")
      .select("password_hash")
      .eq("id", 1)
      .maybeSingle();
    if (data?.password_hash) return { dbHash: data.password_hash };
  } catch {
    // service key 미설정 → env 폴백
  }
  const envPw = process.env.ADMIN_PASSWORD;
  return envPw ? { envPw } : null;
}

/** 세션 토큰 = 현재 비밀(해시 or env 비번) 기반 → 비번 바꾸면 기존 세션 자동 무효화 */
function sessionToken(secret: { dbHash?: string; envPw?: string }): string {
  const base = secret.dbHash ?? secret.envPw ?? "";
  return createHash("sha256").update(base + ":birthday-board").digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const secret = await adminSecret();
  if (!secret) return false;
  return cookies().get(COOKIE)?.value === sessionToken(secret);
}

async function assertAdmin() {
  if (!(await isAdmin())) {
    throw new Error("권한이 없습니다.");
  }
}

function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  const secret = await adminSecret();
  if (!secret) redirect("/admin?error=noenv");
  const ok = secret.dbHash ? verifyPassword(pw, secret.dbHash) : pw === secret.envPw;
  if (!ok) redirect("/admin?error=1");
  setSessionCookie(sessionToken(secret));
  redirect("/admin");
}

export async function logout() {
  cookies().delete(COOKIE);
  redirect("/admin");
}

/** 비밀번호 변경 (기존 비번 확인 → DB 해시 교체 → 새 세션 발급) */
export async function changePassword(formData: FormData) {
  await assertAdmin();
  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (next.length < 4) redirect("/admin?error=pwshort");
  if (next !== confirm) redirect("/admin?error=pwmismatch");

  const secret = await adminSecret();
  if (!secret?.dbHash) redirect("/admin?error=pwnodb"); // DB 연결 없으면 변경 불가
  const okCurrent = verifyPassword(current, secret.dbHash!);
  if (!okCurrent) redirect("/admin?error=pwwrong");

  const newHash = hashPassword(next);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("admin_config")
    .update({ password_hash: newHash, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) redirect("/admin?error=pwfail");

  setSessionCookie(sessionToken({ dbHash: newHash }));
  revalidatePath("/admin");
  redirect("/admin?ok=pw");
}

/** 태그 문자열 정리: 콤마 분리 + 앞의 # 제거 + trim + 소문자 */
function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().replace(/^#+/, "").trim().toLowerCase())
    .filter(Boolean);
}

/** 사진 업로드(다중) + taken_date/caption/tags 공통 적용 */
export async function uploadPhotos(formData: FormData) {
  await assertAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const takenDate = String(formData.get("taken_date") ?? "").trim() || null;
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const tags = parseTags(String(formData.get("tags") ?? ""));

  if (files.length === 0) redirect("/admin?error=nofile");

  const supabase = createServiceClient();
  let okCount = 0;
  let failCount = 0;

  for (const file of files) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("photos")
      .upload(path, buffer, { contentType: file.type || "image/jpeg", upsert: false });
    if (upErr) {
      failCount++;
      continue;
    }
    const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
    const { data: photo, error: insErr } = await supabase
      .from("photos")
      .insert({ image_url: pub.publicUrl, taken_date: takenDate, caption })
      .select()
      .single();
    if (insErr || !photo) {
      failCount++;
      continue;
    }
    if (tags.length > 0) {
      await supabase.from("photo_tags").insert(
        tags.map((name) => ({ photo_id: photo.id, friend_name: name }))
      );
    }
    okCount++;
  }

  revalidatePath("/admin");
  if (okCount === 0) redirect("/admin?error=upfail");
  if (failCount > 0) redirect(`/admin?ok=upload&fail=${failCount}`);
  redirect("/admin?ok=upload");
}

/** 사진의 태그를 통째로 교체 */
export async function updateTags(formData: FormData) {
  await assertAdmin();
  const photoId = String(formData.get("photo_id") ?? "");
  const tags = parseTags(String(formData.get("tags") ?? ""));
  if (!photoId) return;
  const supabase = createServiceClient();
  await supabase.from("photo_tags").delete().eq("photo_id", photoId);
  if (tags.length > 0) {
    await supabase
      .from("photo_tags")
      .insert(tags.map((name) => ({ photo_id: photoId, friend_name: name })));
  }
  revalidatePath("/admin");
}

/** 사진 삭제 (photo_tags는 cascade) */
export async function deletePhoto(formData: FormData) {
  await assertAdmin();
  const photoId = String(formData.get("photo_id") ?? "");
  if (!photoId) return;
  const supabase = createServiceClient();
  await supabase.from("photos").delete().eq("id", photoId);
  revalidatePath("/admin");
}

/** 보드 생성 (친구 이름 + 선택 환영 메시지) */
export async function createBoard(formData: FormData) {
  await assertAdmin();
  const rawName = String(formData.get("friend_name") ?? "").trim();
  const welcome = String(formData.get("welcome_message") ?? "").trim() || null;
  if (!rawName) redirect("/admin?error=noname");
  const supabase = createServiceClient();
  const { error } = await supabase.from("boards").insert({
    friend_name: rawName.toLowerCase(),
    display_name: rawName,
    welcome_message: welcome,
  });
  revalidatePath("/admin");
  if (error) {
    // 23505 = unique_violation (이미 있는 이름)
    redirect(error.code === "23505" ? "/admin?error=dupboard" : "/admin?error=board");
  }
  redirect("/admin?ok=board");
}

/** 보드 삭제 (사진/방명록 데이터는 유지 — 태그 기반 노출은 계속됨) */
export async function deleteBoard(formData: FormData) {
  await assertAdmin();
  const boardId = String(formData.get("board_id") ?? "");
  if (!boardId) return;
  const supabase = createServiceClient();
  await supabase.from("boards").delete().eq("id", boardId);
  revalidatePath("/admin");
}

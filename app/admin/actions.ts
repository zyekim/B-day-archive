"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase";

const COOKIE = "admin_session";

function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(pw + ":birthday-board").digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const token = expectedToken();
  if (!token) return false;
  return cookies().get(COOKIE)?.value === token;
}

function assertAdmin() {
  const token = expectedToken();
  if (!token || cookies().get(COOKIE)?.value !== token) {
    throw new Error("권한이 없습니다.");
  }
}

export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  const envPw = process.env.ADMIN_PASSWORD;
  if (!envPw) redirect("/admin?error=noenv");
  if (pw !== envPw) redirect("/admin?error=1");
  const token = expectedToken()!;
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export async function logout() {
  cookies().delete(COOKIE);
  redirect("/admin");
}

/** 사진 업로드(다중) + taken_date/caption/tags 공통 적용 */
export async function uploadPhotos(formData: FormData) {
  assertAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const takenDate = String(formData.get("taken_date") ?? "").trim() || null;
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (files.length === 0) redirect("/admin?error=nofile");

  const supabase = createServiceClient();

  for (const file of files) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("photos")
      .upload(path, buffer, { contentType: file.type || "image/jpeg", upsert: false });
    if (upErr) continue;
    const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
    const { data: photo, error: insErr } = await supabase
      .from("photos")
      .insert({ image_url: pub.publicUrl, taken_date: takenDate, caption })
      .select()
      .single();
    if (insErr || !photo) continue;
    if (tags.length > 0) {
      await supabase.from("photo_tags").insert(
        tags.map((name) => ({ photo_id: photo.id, friend_name: name.toLowerCase() }))
      );
    }
  }

  revalidatePath("/admin");
  redirect("/admin?ok=upload");
}

/** 사진의 태그를 통째로 교체 */
export async function updateTags(formData: FormData) {
  assertAdmin();
  const photoId = String(formData.get("photo_id") ?? "");
  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!photoId) return;
  const supabase = createServiceClient();
  await supabase.from("photo_tags").delete().eq("photo_id", photoId);
  if (tags.length > 0) {
    await supabase
      .from("photo_tags")
      .insert(tags.map((name) => ({ photo_id: photoId, friend_name: name.toLowerCase() })));
  }
  revalidatePath("/admin");
}

/** 사진 삭제 (photo_tags는 cascade) */
export async function deletePhoto(formData: FormData) {
  assertAdmin();
  const photoId = String(formData.get("photo_id") ?? "");
  if (!photoId) return;
  const supabase = createServiceClient();
  await supabase.from("photos").delete().eq("id", photoId);
  revalidatePath("/admin");
}

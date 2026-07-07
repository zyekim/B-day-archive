import { supabaseConfigured, createServiceClient } from "@/lib/supabase";
import SetupNotice from "@/components/SetupNotice";
import { isAdmin, login, logout, uploadPhotos, updateTags, deletePhoto } from "./actions";
import type { Photo, PhotoTag } from "@/lib/types";

export const dynamic = "force-dynamic";

function LoginGate({ error }: { error?: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
      <form action={login} className="w-full bg-polaroid p-6 shadow-polaroid">
        <h1 className="mb-4 text-center font-pixel text-lg text-album-navy">주인장 전용</h1>
        <label htmlFor="password" className="mb-2 block font-pixel text-[11px] text-album-navy">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="mb-3 w-full rounded-sm border border-paper-line bg-white/70 px-3 py-2 font-body text-ink outline-none focus-visible:ring-2 focus-visible:ring-stamp-orange"
        />
        {error === "1" && <p className="mb-2 text-sm text-[#c0392b]">비밀번호가 틀렸어요.</p>}
        {error === "noenv" && (
          <p className="mb-2 text-sm text-[#c0392b]">ADMIN_PASSWORD 환경변수가 설정되지 않았어요.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-sm bg-album-navy py-2.5 font-pixel text-[12px] text-white hover:bg-album-navy/90 focus-visible:ring-2 focus-visible:ring-stamp-orange"
        >
          입장
        </button>
      </form>
    </main>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  if (!supabaseConfigured) return <SetupNotice />;
  if (!(await isAdmin())) return <LoginGate error={searchParams.error} />;

  const supabase = createServiceClient();
  const { data: photosData } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });
  const photos = (photosData ?? []) as Photo[];

  const { data: tagsData } = await supabase.from("photo_tags").select("*");
  const tags = (tagsData ?? []) as PhotoTag[];

  const tagMap = new Map<string, string[]>();
  for (const t of tags) {
    const arr = tagMap.get(t.photo_id) ?? [];
    arr.push(t.friend_name);
    tagMap.set(t.photo_id, arr);
  }
  const allNames = Array.from(new Set(tags.map((t) => t.friend_name))).sort();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-pixel text-lg text-album-navy">사진 관리</h1>
        <form action={logout}>
          <button className="font-pixel text-[11px] text-stamp-orange underline">로그아웃</button>
        </form>
      </div>

      {searchParams.ok === "upload" && (
        <p className="mb-4 rounded-sm bg-[#DFF3E8] px-3 py-2 text-sm text-[#0F6E56]">업로드 완료!</p>
      )}
      {searchParams.error === "nofile" && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">파일을 선택해주세요.</p>
      )}

      {/* 업로드 폼 */}
      <form action={uploadPhotos} className="mb-10 rounded-md border border-cork/40 bg-polaroid p-5 shadow-sm">
        <h2 className="mb-3 font-pixel text-[12px] text-album-navy">새 사진 업로드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-ink sm:col-span-2">
            사진 파일 (여러 장 선택 가능)
            <input
              name="files"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              required
              className="text-xs file:mr-2 file:rounded-sm file:border-0 file:bg-album-navy file:px-2 file:py-1 file:text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            촬영 날짜 (타임스탬프)
            <input name="taken_date" type="date" className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-ink" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            캡션 (손글씨)
            <input name="caption" maxLength={60} placeholder="여름 바다에서" className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-ink" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink sm:col-span-2">
            친구 이름 태그 (콤마로 구분)
            <input
              name="tags"
              list="all-names"
              placeholder="지혜, 민수"
              className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-ink"
            />
          </label>
        </div>
        <button className="mt-4 rounded-sm bg-stamp-orange px-5 py-2 font-pixel text-[11px] text-white hover:brightness-95">
          업로드
        </button>
      </form>

      <datalist id="all-names">
        {allNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {/* 사진 목록 */}
      <h2 className="mb-3 font-pixel text-[12px] text-album-navy">업로드된 사진 ({photos.length})</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {photos.map((p) => (
          <li key={p.id} className="rounded-md border border-cork/40 bg-polaroid p-3 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt={p.caption || ""} className="mb-2 h-40 w-full rounded-sm object-cover" />
            <p className="mb-1 text-xs text-ink/70">
              {p.taken_date || "날짜 없음"} · {p.caption || "캡션 없음"}
            </p>
            <form action={updateTags} className="flex items-center gap-2">
              <input type="hidden" name="photo_id" value={p.id} />
              <input
                name="tags"
                list="all-names"
                defaultValue={(tagMap.get(p.id) ?? []).join(", ")}
                placeholder="태그 (콤마 구분)"
                className="flex-1 rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-sm text-ink"
              />
              <button className="rounded-sm bg-album-navy px-3 py-1 font-pixel text-[10px] text-white hover:bg-album-navy/90">
                저장
              </button>
            </form>
            <form action={deletePhoto} className="mt-2 text-right">
              <input type="hidden" name="photo_id" value={p.id} />
              <button className="font-pixel text-[10px] text-[#c0392b] underline">삭제</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}

import { supabaseConfigured, createServiceClient } from "@/lib/supabase";
import SetupNotice from "@/components/SetupNotice";
import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";
import { isAdmin, login, logout, uploadPhotos, updateTags, deletePhoto, createBoard, deleteBoard, changePassword } from "./actions";
import type { Photo, PhotoTag, Board } from "@/lib/types";

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
          <p className="mb-2 text-sm text-[#c0392b]">
            어드민 설정을 불러올 수 없어요. SUPABASE_SERVICE_ROLE_KEY 환경변수를 확인해주세요.
          </p>
        )}
        <SubmitButton
          pendingText="확인 중..."
          className="w-full rounded-sm bg-album-navy py-2.5 font-pixel text-[12px] text-white hover:bg-album-navy/90 focus-visible:ring-2 focus-visible:ring-stamp-orange"
        >
          입장
        </SubmitButton>
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

  const { data: boardsData } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: true });
  const boards = (boardsData ?? []) as Board[];

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
          <SubmitButton pendingText="로그아웃 중..." className="font-pixel text-[11px] text-stamp-orange underline">
            로그아웃
          </SubmitButton>
        </form>
      </div>

      {searchParams.ok === "upload" && (
        <p className="mb-4 rounded-sm bg-[#DFF3E8] px-3 py-2 text-sm text-[#0F6E56]">업로드 완료!</p>
      )}
      {searchParams.ok === "board" && (
        <p className="mb-4 rounded-sm bg-[#DFF3E8] px-3 py-2 text-sm text-[#0F6E56]">보드 생성 완료!</p>
      )}
      {searchParams.error === "nofile" && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">파일을 선택해주세요.</p>
      )}
      {searchParams.error === "noname" && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">친구 이름을 입력해주세요.</p>
      )}
      {searchParams.error === "dupboard" && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">이미 같은 이름의 보드가 있어요.</p>
      )}
      {searchParams.error === "board" && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">보드 생성에 실패했어요. 다시 시도해주세요.</p>
      )}
      {searchParams.ok === "pw" && (
        <p className="mb-4 rounded-sm bg-[#DFF3E8] px-3 py-2 text-sm text-[#0F6E56]">비밀번호가 변경됐어요!</p>
      )}
      {searchParams.error === "pwshort" && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">새 비밀번호는 4자 이상이어야 해요.</p>
      )}
      {searchParams.error === "pwmismatch" && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">새 비밀번호 확인이 일치하지 않아요.</p>
      )}
      {searchParams.error === "pwwrong" && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">현재 비밀번호가 틀렸어요.</p>
      )}
      {(searchParams.error === "pwnodb" || searchParams.error === "pwfail") && (
        <p className="mb-4 rounded-sm bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">비밀번호 변경에 실패했어요. DB 연결(SUPABASE_SERVICE_ROLE_KEY)을 확인해주세요.</p>
      )}

      {/* 보드 관리 */}
      <section className="mb-10 rounded-md border border-cork/40 bg-polaroid p-5 shadow-sm">
        <h2 className="mb-3 font-pixel text-[12px] text-album-navy">보드 관리</h2>

        <form action={createBoard} className="mb-5 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-ink">
            친구 이름
            <input
              name="friend_name"
              required
              maxLength={30}
              placeholder="지혜"
              className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            환영 쪽지 (비우면 기본 문구)
            <input
              name="welcome_message"
              maxLength={80}
              placeholder="지혜야 생일 축하해! 🎂"
              className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-ink"
            />
          </label>
          <div className="sm:col-span-2">
            <SubmitButton
              pendingText="만드는 중..."
              className="rounded-sm bg-stamp-orange px-5 py-2 font-pixel text-[11px] text-white hover:brightness-95"
            >
              보드 만들기
            </SubmitButton>
          </div>
        </form>

        {boards.length === 0 ? (
          <p className="text-sm text-ink/60">아직 만든 보드가 없어요.</p>
        ) : (
          <ul className="divide-y divide-paper-line/60">
            {boards.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <Link
                    href={`/${encodeURIComponent(b.display_name)}`}
                    target="_blank"
                    className="font-pixel text-[12px] text-album-navy underline"
                  >
                    {b.display_name}
                  </Link>
                  <p className="truncate text-xs text-ink/60">
                    {b.welcome_message || "기본 환영 문구"}
                  </p>
                </div>
                <form action={deleteBoard}>
                  <input type="hidden" name="board_id" value={b.id} />
                  <SubmitButton
                    pendingText="삭제 중..."
                    className="shrink-0 font-pixel text-[10px] text-[#c0392b] underline"
                  >
                    삭제
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

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
        <SubmitButton
          pendingText="업로드 중..."
          className="mt-4 rounded-sm bg-stamp-orange px-5 py-2 font-pixel text-[11px] text-white hover:brightness-95"
        >
          업로드
        </SubmitButton>
      </form>

      <datalist id="all-names">
        {allNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {/* 비밀번호 변경 */}
      <section className="mb-10 rounded-md border border-cork/40 bg-polaroid p-5 shadow-sm">
        <h2 className="mb-3 font-pixel text-[12px] text-album-navy">비밀번호 변경</h2>
        <form action={changePassword} className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-ink">
            현재 비밀번호
            <input
              name="current_password"
              type="password"
              required
              className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            새 비밀번호 (4자 이상)
            <input
              name="new_password"
              type="password"
              required
              minLength={4}
              className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            새 비밀번호 확인
            <input
              name="confirm_password"
              type="password"
              required
              minLength={4}
              className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-ink"
            />
          </label>
          <div className="sm:col-span-3">
            <SubmitButton
              pendingText="변경 중..."
              className="rounded-sm bg-album-navy px-5 py-2 font-pixel text-[11px] text-white hover:bg-album-navy/90"
            >
              변경하기
            </SubmitButton>
          </div>
        </form>
      </section>

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
              <SubmitButton
                pendingText="저장 중..."
                className="rounded-sm bg-album-navy px-3 py-1 font-pixel text-[10px] text-white hover:bg-album-navy/90"
              >
                저장
              </SubmitButton>
            </form>
            <form action={deletePhoto} className="mt-2 text-right">
              <input type="hidden" name="photo_id" value={p.id} />
              <SubmitButton
                pendingText="삭제 중..."
                className="font-pixel text-[10px] text-[#c0392b] underline"
              >
                삭제
              </SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}

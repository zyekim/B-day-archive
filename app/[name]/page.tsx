import Link from "next/link";
import {getBoardData} from "@/lib/queries";
import {supabaseConfigured} from "@/lib/supabase";
import {seededPick} from "@/lib/seed-rotation";
import SetupNotice from "@/components/SetupNotice";
import CorkBoard from "@/components/board/CorkBoard";
import NameTag from "@/components/board/NameTag";
import Receipt from "@/components/board/Receipt";
import GuestbookThread from "@/components/board/GuestbookThread";
import UploadForm from "@/components/board/UploadForm";
import Doily from "@/components/deco/Doily";
import PatchScatter from "@/components/deco/PatchScatter";
import Polaroid from "@/components/photo/Polaroid";
import PhotoStrip from "@/components/photo/PhotoStrip";

export const dynamic = "force-dynamic";

export default async function BoardPage({params}: {params: {name: string}}) {
  if (!supabaseConfigured) return <SetupNotice />;

  const board = await getBoardData(params.name);
  const {displayName, photos, uploads, comments, likeCount} = board;
  const welcomeMessage = board.board?.welcome_message ?? null;

  if (board.isEmpty) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <div className="w-full bg-polaroid p-6 shadow-polaroid">
          <h1 className="mb-3 font-pixel text-lg text-album-navy">
            {displayName}님?
          </h1>
          <p className="font-hand text-2xl leading-8 text-ink">
            아직 우리 사진이
            <br />
            업로드 안 됐나봐요!
            <br />
            주인장에게 연락해주세요 🥲
          </p>
          <Link
            href="/"
            className="mt-4 inline-block font-pixel text-[11px] text-stamp-orange underline"
          >
            ← 다른 이름으로
          </Link>
        </div>
      </main>
    );
  }

  // 4장 이상이면 인생네컷 스트립 1개 (시드 고정)
  const stripPhotos =
    photos.length >= 4
      ? [...photos]
          .sort((a, b) =>
            (a.id + displayName).localeCompare(b.id + displayName),
          )
          .slice(0, 4)
      : [];

  return (
    <main className="mx-auto max-w-5xl px-3 py-8 sm:px-6">
      <header className="mb-4 text-center">
        <Link
          href="/"
          className="font-pixel text-[11px] text-album-navy/70 underline"
        >
          ← 입구로
        </Link>
      </header>

      <CorkBoard className="p-4 sm:p-8" minHeight={560}>
        <PatchScatter seed={displayName} count={5} />

        {/* 상단: 네임태그 + 환영 쪽지 */}
        <div className="relative z-10 mb-6 flex flex-wrap items-start justify-between gap-4">
          <NameTag name={displayName} className="rotate-[-3deg]" />
          <div
            className="w-[220px] rotate-[1.5deg] px-4 py-3 shadow-polaroid"
            style={{
              backgroundColor: "#FFF7C2",
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 23px, #9FB4D8 24px)",
            }}
          >
            <span
              aria-hidden="true"
              className="mx-auto mb-1 block h-4 w-16 -rotate-3 border border-[#d2b45a]/40 bg-[rgba(255,253,247,0.7)]"
            />
            <p className="whitespace-pre-line font-hand text-xl leading-6 text-ink">
              {welcomeMessage ?? (
                <>
                  {displayName}아 생일 축하해줘 고마워! 🎂
                  <br />
                  같이 찍은 사진 모아뒀어.
                  <br />
                  좋아요랑 쪽지 남겨줘~
                </>
              )}
            </p>
          </div>
        </div>

        {/* 사진 콜라주: 데스크톱 자유배치 느낌 + 모바일 2열 */}
        <section className="relative z-10">
          <div className="grid grid-cols-2 justify-items-center gap-6 sm:flex sm:flex-wrap sm:items-start sm:justify-center sm:gap-8">
            {photos.map((p, i) => (
              <Polaroid
                key={p.id}
                id={p.id}
                imageUrl={p.image_url}
                caption={p.caption}
                takenDate={p.taken_date}
                boardName={displayName}
                likeCount={p.likeCount}
                liked={p.likeCount > 0}
                width={seededPick(p.id, [180, 200, 210], "w") as number}
                priority={i < 2}
              />
            ))}
            {stripPhotos.length === 4 && (
              <PhotoStrip
                id={displayName + ":strip"}
                photos={stripPhotos}
                width={132}
              />
            )}
          </div>
        </section>

        {/* 내가 붙인 사진 */}
        <section className="relative z-10 mt-10">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-ink/20" />
            <h2 className="font-pixel text-[12px] text-album-navy">
              내가 붙인 사진
            </h2>
            <span className="h-px w-10 bg-ink/20" />
          </div>
          {uploads.length > 0 && (
            <div className="mb-4 grid grid-cols-2 justify-items-center gap-6 sm:flex sm:flex-wrap sm:justify-center sm:gap-8">
              {uploads.map((u) => (
                <Polaroid
                  key={u.id}
                  id={u.id}
                  imageUrl={u.image_url}
                  caption={u.caption}
                  showLike={false}
                  width={180}
                />
              ))}
            </div>
          )}
          <UploadForm boardName={displayName} />
        </section>

        {/* 영수증 통계 */}
        <section className="relative z-10 mt-10 flex justify-center sm:justify-end">
          <div className="relative">
            <Doily size={190} className="absolute -left-6 -top-6 opacity-70" />
            <Receipt
              name={displayName}
              photoCount={photos.length + uploads.length}
              likeCount={likeCount}
              commentCount={comments.length}
              className="relative rotate-[-2deg]"
            />
          </div>
        </section>

        {/* 방명록 */}
        <section className="relative z-10 mt-12">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-ink/20" />
            <h2 className="font-pixel text-[12px] text-album-navy">방명록</h2>
            <span className="h-px w-10 bg-ink/20" />
          </div>
          <GuestbookThread boardName={displayName} initialComments={comments} />
        </section>
      </CorkBoard>
    </main>
  );
}

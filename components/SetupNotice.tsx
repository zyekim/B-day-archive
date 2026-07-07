import Link from "next/link";

/** Supabase 환경변수가 없을 때 보여주는 안내 (크래시 방지) */
export default function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="w-full bg-polaroid p-6 shadow-polaroid">
        <h1 className="mb-3 font-pixel text-lg text-album-navy">아직 준비 중이에요</h1>
        <p className="font-body text-sm leading-6 text-ink">
          Supabase 연결이 설정되지 않았습니다.
          <br />
          <code className="rounded bg-cork/20 px-1">.env.local</code>에
          <br />
          <code className="rounded bg-cork/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code>,
          <br />
          <code className="rounded bg-cork/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>를 넣고
          <br />
          다시 실행해주세요.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block font-pixel text-[11px] text-stamp-orange underline"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}

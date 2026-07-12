/** 보드 데이터 로드 중 표시되는 로딩 화면 (Next.js App Router 자동 적용) */
export default function BoardLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-[280px] rotate-[-2deg] bg-polaroid p-5 pb-7 shadow-polaroid">
        <div className="mb-3 grid h-40 w-full place-items-center bg-gradient-to-br from-[#e7d3b0] to-[#b59a72]">
          <span
            aria-hidden="true"
            className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/50 border-t-white"
          />
        </div>
        <p className="font-hand text-2xl text-ink">보드 가져오는 중...</p>
        <p className="mt-1 font-pixel text-[10px] text-album-navy/60">필름 현상 중이에요 📸</p>
      </div>
    </main>
  );
}

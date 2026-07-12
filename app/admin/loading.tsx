/** 어드민 데이터 로드 중 표시되는 로딩 화면 */
export default function AdminLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
      <div className="flex w-full flex-col items-center gap-3 bg-polaroid p-6 shadow-polaroid">
        <span
          aria-hidden="true"
          className="h-7 w-7 animate-spin rounded-full border-[3px] border-album-navy/25 border-t-album-navy"
        />
        <p className="font-pixel text-[12px] text-album-navy">불러오는 중...</p>
      </div>
    </main>
  );
}

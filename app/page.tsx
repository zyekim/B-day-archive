"use client";

import {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import Patch from "@/components/deco/Patch";

export default function EntryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function go(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n || pending) return;
    startTransition(() => {
      router.push(`/${encodeURIComponent(n)}`);
    });
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center overflow-hidden px-6">
      {/* 데코 패치 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Patch
          seed="entry-1"
          size={70}
          className="absolute left-[8%] top-[14%]"
        />
        <Patch
          seed="entry-2"
          size={58}
          className="absolute right-[10%] top-[20%]"
        />
        <Patch
          seed="entry-3"
          size={64}
          className="absolute left-[14%] bottom-[16%]"
        />
        <Patch
          seed="entry-4"
          size={52}
          className="absolute right-[14%] bottom-[20%]"
        />
      </div>

      {/* 데코 폴라로이드 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden sm:block"
      >
        <div className="absolute left-[6%] top-[34%] w-24 -rotate-6 bg-polaroid p-2 pb-6 shadow-polaroid">
          <div className="h-20 w-full bg-gradient-to-br from-[#d8c4a0] to-[#a88f6a]" />
          <p className="mt-1 text-center font-hand text-base text-ink">추억</p>
        </div>
        <div className="absolute right-[6%] top-[40%] w-24 rotate-6 bg-polaroid p-2 pb-6 shadow-polaroid">
          <div className="h-20 w-full bg-gradient-to-br from-[#e7d3b0] to-[#b59a72]" />
          <p className="mt-1 text-center font-hand text-base text-ink">우정</p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <p className="mb-2 font-hand text-2xl text-dusty-rose">
          반짝반짝 우리들 공간
        </p>
        <h1 className="mb-8 font-pixel text-[22px] leading-relaxed text-album-navy sm:text-2xl">
          누구의 방명록에
          <br />
          놀러 오셨나요?
        </h1>

        <form
          onSubmit={go}
          className="mx-auto w-full max-w-sm bg-polaroid p-5 shadow-polaroid"
        >
          <label
            htmlFor="name"
            className="mb-2 block text-left font-pixel text-[11px] text-album-navy"
          >
            친구 이름을 입력하세요
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 지혜"
            className="mb-3 w-full rounded-sm border border-paper-line bg-white/70 px-3 py-2 font-hand text-2xl text-ink outline-none focus-visible:ring-2 focus-visible:ring-stamp-orange"
          />
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="w-full rounded-sm bg-stamp-orange py-2.5 font-pixel text-[12px] text-white transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-album-navy disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 animate-spin rounded-full border-2 border-white/50 border-t-white"
                />
                보드 여는 중...
              </span>
            ) : (
              "내 보드 열기"
            )}
          </button>
        </form>

        <p className="mt-6 font-body text-xs text-ink/60">
          🎂 35번째 생일을 축하하며, 함께 찍은 사진을 모았어요
        </p>
      </div>
    </main>
  );
}

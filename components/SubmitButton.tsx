"use client";

import { useFormStatus } from "react-dom";

/**
 * 서버 액션 <form> 안에서 쓰는 제출 버튼.
 * 제출 중이면 자동으로 비활성화 + 스피너 + pendingText 표시 (useFormStatus).
 */
export default function SubmitButton({
  children,
  pendingText,
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {pending ? (
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
          />
          {pendingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

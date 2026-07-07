import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리의 추억 방명록",
  description: "함께 찍은 사진들이 붙어 있는 코르크보드 스크랩북",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-body text-ink antialiased">{children}</body>
    </html>
  );
}

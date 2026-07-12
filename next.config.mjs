/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig = {
  experimental: {
    serverActions: {
      // 어드민 다중 사진 업로드용 (기본 1MB → 10MB)
      bodySizeLimit: "10mb",
    },
    // 페이지 이동 시 30초 캐시 때문에 새 쪽지/사진이 늦게 보이는 문제 방지
    staleTimes: {
      dynamic: 0,
    },
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost }]
      : [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;

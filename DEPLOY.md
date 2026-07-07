# 🎂 생일 추억 보드 · 실행 & 배포 가이드

친구가 이름을 입력하면, 함께 찍은 사진이 붙은 **코르크보드 스크랩북**이 열리고
좋아요·사진 업로드·방명록 쪽지를 남길 수 있는 웹앱입니다.

- 기술: Next.js 14 (App Router) · Tailwind CSS · Supabase (Postgres + Storage)
- 디자인: 2000년대 디카 × 싸이월드 미니홈피 × 코르크보드 콜라주

---

## 0. 폴더 구조

```
app/
  layout.tsx          전역 폰트/배경
  page.tsx            입구 (이름 입력)
  [name]/page.tsx     친구 보드 (핵심)
  admin/page.tsx      어드민 (비밀번호 게이트)
  admin/actions.ts    서버 액션 (service_role)
  globals.css
components/
  board/  CorkBoard · NameTag · Receipt · GuestbookThread · UploadForm
  photo/  Polaroid · PhotoStrip · Timestamp · LikeButton
  deco/   Pin · Bow · Tape · Clip · Patch · Doily · Attachment · PatchScatter
  SetupNotice.tsx
lib/
  supabase.ts         anon / service_role 클라이언트 분리
  queries.ts          보드 데이터 로드
  seed-rotation.ts    id 기반 고정 기울기/핀 시드 (SSR/CSR 불일치 방지)
  deco.ts             public/deco 에셋 매니페스트
  types.ts
public/deco/          board.svg · pin1~5.png · Patch 1~18.png (업로드한 에셋)
supabase/schema.sql   DB + Storage + RLS 스키마
tailwind.config.ts    디자인 토큰
```

> `_old_cra/` 폴더는 이전 Create React App 잔여물입니다. Finder에서 삭제하셔도 됩니다.

---

## 1. Supabase 준비

1. https://supabase.com 에서 New Project 생성 (리전: **Northeast Asia / Seoul**)
2. 대시보드 → **SQL Editor** → `supabase/schema.sql` 전체 내용을 붙여넣고 **Run**
   - photos / photo_tags / board_likes / board_uploads / comments 테이블
   - `photos` Storage 버킷(public)
   - RLS 정책 (anon 읽기·쓰기 허용, delete/update 차단)
   - 친구 업로드는 Storage `uploads/` 폴더로만, 어드민 업로드는 service_role로 `photos/` 폴더
3. 대시보드 → **Settings → API** 에서 키 3개 복사:
   - `Project URL`
   - `anon public` 키
   - `service_role` 키 ⚠️ **서버 전용 · 절대 노출 금지**

---

## 2. 로컬 실행

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 파일 만들기
cp .env.example .env.local
# .env.local 을 열어 4개 값 채우기:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY   (서버 전용)
#   ADMIN_PASSWORD              (직접 정한 비밀번호)

# 3) 개발 서버
npm run dev
# → http://localhost:3000
```

- 입구: `http://localhost:3000`
- 친구 보드: `http://localhost:3000/지혜`
- 어드민: `http://localhost:3000/admin` (ADMIN_PASSWORD로 로그인)

> `.env.local` 이 없으면 보드/어드민 페이지가 크래시 대신 "아직 준비 중이에요" 안내를 보여줍니다.

---

## 3. 사진 올리기 (어드민)

1. `/admin` 접속 → 비밀번호 입력
2. **새 사진 업로드**: 파일(여러 장 가능) + 촬영 날짜(타임스탬프에 사용) + 캡션 + 친구 이름 태그(콤마 구분)
3. 아래 **업로드된 사진** 목록에서 태그 수정 / 삭제 가능
4. 친구 이름은 친구들에게 알려줄 이름 그대로 태그 (대소문자·앞뒤 공백은 자동 무시)

---

## 4. Vercel 배포

1. GitHub에 repo 생성 후 push
   - ⚠️ `.env.local` 은 `.gitignore`에 포함되어 커밋되지 않습니다 (정상)
2. https://vercel.com → **Add New → Project** → GitHub repo Import
3. **Environment Variables**에 4개 입력:

   | Key | 값 |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public 키 |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 (Production/Preview) |
   | `ADMIN_PASSWORD` | 직접 정한 비밀번호 |

4. **Deploy** → 이후 push마다 자동 재배포
5. 배포 후 친구들에게 `https://<your-app>.vercel.app` 공유 🎉

---

## 5. 배포 전 체크리스트

- [ ] `supabase/schema.sql` 실행 완료 (테이블 5개 + photos 버킷 + RLS)
- [ ] `.env.local` 4개 값 채움, `npm run dev`로 정상 동작 확인
- [ ] 어드민에서 사진 1~2장 업로드 + 친구 이름 태그 테스트
- [ ] 친구 보드에서 좋아요 / 방명록 / 사진 업로드 동작 확인
- [ ] `service_role` 키가 GitHub에 커밋되지 않았는지 확인 (`NEXT_PUBLIC_` 접두사 금지)
- [ ] Vercel 환경변수 4개 입력 후 Deploy

---

## 검증 기록

- `next build`: ✅ 컴파일 · 타입체크 · 정적 생성(5/5) 통과
- 라우트: `/`(static), `/[name]`(dynamic), `/admin`(dynamic), `/_not-found`
- 런타임 스모크: `/` 200(입구 렌더), env 미설정 시 `/admin`·`/[name]` 안내 화면 폴백(200, 크래시 없음)

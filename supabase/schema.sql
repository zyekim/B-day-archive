-- ============================================================
-- 생일 추억 보드 · Supabase 스키마
-- Supabase 대시보드 → SQL Editor에 아래 전체를 붙여넣고 실행하세요.
-- (순서대로 한 번에 실행하면 됩니다)
-- ============================================================

-- 1) 테이블 --------------------------------------------------
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  taken_date date,
  caption text,
  created_at timestamptz default now()
);

create table if not exists photo_tags (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  friend_name text not null
);
create index if not exists idx_photo_tags_name on photo_tags (lower(friend_name));

create table if not exists board_likes (
  id uuid primary key default gen_random_uuid(),
  friend_name text not null,
  photo_id uuid references photos(id) on delete cascade,
  created_at timestamptz default now(),
  unique (friend_name, photo_id)
);

create table if not exists board_uploads (
  id uuid primary key default gen_random_uuid(),
  friend_name text not null,
  image_url text not null,
  caption text,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  friend_name text not null,          -- 보드 주인(누구의 보드인지)
  author_name text not null,          -- 쪽지 남긴 사람
  message text not null,
  created_at timestamptz default now()
);

-- 어드민 설정 (비밀번호 해시 저장 · 단일 행 · RLS 정책 없음 = anon 접근 차단)
create table if not exists admin_config (
  id int primary key default 1 check (id = 1),
  password_hash text not null,   -- 형식: scrypt salt:hash (hex)
  updated_at timestamptz default now()
);
alter table admin_config enable row level security;

create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  friend_name text not null unique,   -- 정규화(소문자·trim)된 이름
  display_name text not null,         -- 표시용 원본 이름
  welcome_message text,               -- 보드별 환영 쪽지 (null이면 기본 문구)
  created_at timestamptz default now()
);
create index if not exists idx_boards_name on boards (lower(friend_name));

-- 2) Storage 버킷 -------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- 3) RLS: anon 읽기/쓰기 허용, delete/update는 차단 ----------
alter table photos enable row level security;
alter table photo_tags enable row level security;
alter table board_likes enable row level security;
alter table board_uploads enable row level security;
alter table comments enable row level security;
alter table boards enable row level security;

create policy "read photos" on photos for select using (true);
-- boards: anon 읽기만. 생성/삭제는 service_role(어드민 서버 액션)로만.
create policy "read boards" on boards for select using (true);
create policy "read photo_tags" on photo_tags for select using (true);
create policy "read board_likes" on board_likes for select using (true);
create policy "read board_uploads" on board_uploads for select using (true);
create policy "read comments" on comments for select using (true);

create policy "insert likes" on board_likes for insert with check (true);
create policy "insert uploads" on board_uploads for insert with check (true);
create policy "insert comments" on comments for insert with check (true);

-- photos / photo_tags 쓰기는 service_role(어드민 서버 액션)로만.
-- service_role은 RLS를 우회하므로 별도 정책이 필요 없습니다.

-- 4) Storage RLS: 친구 업로드(anon)는 uploads/ 폴더에만 -------
-- 공개 읽기 (public 버킷이라도 정책을 명시)
create policy "public read photos bucket"
on storage.objects for select
using (bucket_id = 'photos');

-- anon 업로드는 uploads/ 하위로만 허용
create policy "anon upload to uploads folder"
on storage.objects for insert
to anon
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = 'uploads'
);

# Sociality - Social Media Frontend

> Dokumentasi ini merangkum implementasi aktual proyek `social-media-app` pada codebase saat ini.

## Ringkasan

`Sociality` adalah aplikasi social media berbasis Next.js App Router dengan fitur inti:

- Registrasi dan login akun.
- Feed postingan dengan infinite scroll.
- Interaksi post: like, save, comment, share.
- Profil pribadi (`/myprofile`) dan profil user lain (`/profile/[username]`).
- Follow dan unfollow user.
- Pencarian user dengan pagination.
- API internal (`/app/api/*`) sebagai proxy ke backend eksternal (`BASE_API_URL`).

## Quick Stack

- `next@16.1.6`
- `react@19.2.3`
- `typescript@5`
- `tailwindcss@4`
- `@tanstack/react-query@5`
- `@reduxjs/toolkit` + `react-redux`
- `sonner` (toast)
- `framer-motion`
- `emoji-picker-react`
- `radix-ui` + komponen `shadcn/ui`

## Fitur Utama

### 1. Authentication

- Halaman `login` dan `register` dengan validasi form di client.
- Session auth disimpan di `localStorage`:
  - `sociality_token`
  - `sociality_user`
- Sync state auth lintas tab menggunakan event:
  - `storage`
  - `sociality:auth-session-updated`

### 2. Feed dan Interaksi Post

- Feed di `/` dan `/home`.
- Infinite scroll untuk load post berikutnya.
- Like/unlike post.
- Save/unsave post.
- Komentar post (buat dan hapus komentar).
- Lihat daftar user yang like sebuah post.
- Share post via Web Share API atau fallback copy link.

### 3. Profil

- `/myprofile`:
  - Tampilkan data profil sendiri + stats.
  - Tab `Gallery` dan `Saved`.
  - Edit profil via `/editprofile`.
  - Lihat daftar `Followers` dan `Following`.
- `/profile/[username]`:
  - Tampilkan profil user lain.
  - Tab `Gallery` dan `Liked`.
  - Follow/unfollow user.

### 4. Search User

- Search user berdasarkan query `q`.
- Infinite scroll hasil pencarian.
- Follow/unfollow langsung dari hasil pencarian.

### 5. Upload

- Buat post di `/addpost`:
  - Wajib upload gambar (`PNG`/`JPG`) maksimal `5MB`.
  - Caption wajib diisi.
- Ubah avatar di `/editprofile`:
  - Format `PNG`/`JPG`/`WEBP`, maksimal `5MB`.

## Arsitektur Singkat

```text
UI (App Router pages/components)
  -> lib/tanstack/post-queries.ts (React Query + fetch wrapper)
  -> Next Route Handlers (/app/api/*)
  -> External Backend API (BASE_API_URL)
```

Karakteristik arsitektur:

- Frontend tidak memanggil backend eksternal secara langsung dari UI.
- Semua call lewat route internal `/api/*`.
- Route internal meneruskan header `Authorization` (jika ada) ke backend.
- Response dikonsolidasikan dalam format umum:
  - `{ success: boolean, message: string, data: ... }`

## Struktur Folder Utama

```text
app/
  (site)/
    page.tsx
    home/page.tsx
    search/page.tsx
    addpost/page.tsx
    myprofile/page.tsx
    profile/[id]/page.tsx
    editprofile/page.tsx
  api/
    auth/*
    posts/*
    comments/*
    follow/*
    me/*
    users/*
  layout.tsx
  globals.css
  fonts/*
components/
  providers/
  site/
  ui/
hooks/
  use-mobile.ts
lib/
  auth-session.ts
  redux/*
  tanstack/*
```

## Halaman dan Routing

| Route | Keterangan |
| --- | --- |
| `/` | Feed utama (sama seperti `/home`) |
| `/home` | Feed utama |
| `/login` | Login |
| `/register` | Registrasi |
| `/search?q=...` | Hasil pencarian user |
| `/addpost` | Form tambah post |
| `/myprofile` | Profil milik user login |
| `/editprofile` | Form edit profil |
| `/profile/[username]` | Profil user lain |

## Internal API Endpoints

Semua endpoint di bawah berada pada frontend route `app/api/*` dan mem-proxy request ke backend eksternal.

| Endpoint | Method | Auth | Keterangan |
| --- | --- | --- | --- |
| `/api/auth/login` | `POST` | Tidak | Login |
| `/api/auth/register` | `POST` | Tidak | Register |
| `/api/posts` | `GET` | Opsional | Ambil feed posts |
| `/api/posts` | `POST` | Wajib | Buat post baru (form-data) |
| `/api/posts/[postId]` | `GET` | Opsional | Detail post |
| `/api/posts/[postId]` | `DELETE` | Wajib | Hapus post |
| `/api/posts/[postId]/like` | `POST`, `DELETE` | Wajib | Like/unlike post |
| `/api/posts/[postId]/likes` | `GET` | Opsional | List user yang like post |
| `/api/posts/[postId]/save` | `POST`, `DELETE` | Wajib | Save/unsave post |
| `/api/posts/[postId]/comments` | `GET` | Opsional | Ambil komentar post |
| `/api/posts/[postId]/comments` | `POST` | Wajib | Tambah komentar |
| `/api/comments/[commentId]` | `DELETE` | Wajib | Hapus komentar |
| `/api/follow/[username]` | `POST`, `DELETE` | Wajib | Follow/unfollow user |
| `/api/me` | `GET` | Wajib | Ambil profil sendiri |
| `/api/me` | `PATCH` | Wajib | Update profil sendiri |
| `/api/me/posts` | `GET` | Wajib | Post milik sendiri |
| `/api/me/likes` | `GET` | Wajib | Post yang di-like |
| `/api/me/saved` | `GET` | Wajib | Post yang disimpan |
| `/api/me/following` | `GET` | Wajib | Daftar following |
| `/api/me/followers` | `GET` | Wajib | Daftar followers |
| `/api/users/search` | `GET` | Opsional | Search user (`q` wajib) |
| `/api/users/[username]` | `GET` | Opsional | Detail profil user |
| `/api/users/[username]/posts` | `GET` | Opsional | Post user |
| `/api/users/[username]/likes` | `GET` | Opsional | Liked posts user |
| `/api/users/[username]/following` | `GET` | Opsional | Following user |
| `/api/users/[username]/followers` | `GET` | Opsional | Followers user |

## State Management dan Data Layer

### React Query

- `QueryClient` diinisialisasi pada `components/providers/query-provider.tsx`.
- Default:
  - `queries.retry = 1`
  - `queries.refetchOnWindowFocus = false`
  - `mutations.retry = 0`
- Banyak mutation menggunakan optimistic update:
  - like/unlike post
  - save/unsave post
  - follow/unfollow user

### Redux

- Slice: `auth` (`lib/redux/slices/auth-slice.ts`).
- Menyimpan:
  - `token`
  - `user`
- Sinkron dengan `localStorage` lewat provider.

### Auto Redirect Unauthorized

Pada layer request (`lib/tanstack/post-queries.ts`):

- Jika status `401` atau `403` pada request yang butuh auth:
  - session dibersihkan,
  - user diarahkan ke `/login`.

## Environment Variables

Buat file `.env` di root proyek:

```bash
BASE_API_URL=https://your-backend-domain
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Keterangan:

- `BASE_API_URL` wajib.
- `NEXT_PUBLIC_APP_URL` dipakai untuk `metadataBase` (fallback ke `http://localhost:3000` jika kosong/invalid).

## Menjalankan Proyek

### Prasyarat

- Node.js `>= 20`
- npm

### Instalasi

```bash
npm install
```

### Development

```bash
npm run dev
```

Akses: `http://localhost:3000`

### Build Production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan Next.js dev server |
| `npm run build` | Build production |
| `npm run start` | Menjalankan hasil build production |
| `npm run lint` | Menjalankan ESLint |

## Catatan Implementasi

- Metadata SEO, Open Graph, Twitter card, dan icon diatur di `app/layout.tsx`.
- Font lokal `SF Pro Display` dimuat dari `app/fonts/*` melalui `@font-face` di `app/globals.css`.
- Remote image yang diizinkan saat render `next/image`:
  - `images.unsplash.com`
  - `res.cloudinary.com`
- Tidak ada script test otomatis (`npm test`) pada codebase saat ini.

## Troubleshooting

| Kasus | Gejala | Solusi |
| --- | --- | --- |
| Env backend belum di-set | Response `500` dengan pesan `BASE_API_URL is not configured` | Pastikan `.env` punya `BASE_API_URL` valid |
| Token tidak terkirim/expired | Aksi private gagal `401` atau redirect ke `/login` | Login ulang dan pastikan header `Authorization: Bearer <token>` diteruskan |
| Upload gambar gagal | Validasi file ditolak | Pastikan format dan ukuran file sesuai ketentuan |
| Search tanpa query | Endpoint search mengembalikan `400` | Kirim parameter `q` pada URL |
| Gambar eksternal tidak muncul | Error host gambar tidak diizinkan | Tambahkan domain di `next.config.ts` bagian `images.remotePatterns` |

## Lisensi

Proyek ini digunakan untuk kebutuhan pembelajaran/bootcamp.

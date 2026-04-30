# Multi-Tenancy Plan — Masjid TV SaaS

> **Status:** Future — belum dikerjakan. Catatan arsitektur untuk referensi nanti.

## Konsep

Satu deployment Masjid TV bisa dipakai banyak masjid. Setiap masjid punya:
- Branding sendiri (warna, logo)
- Admin login sendiri
- Website/subdomain sendiri (e.g. `assyams.masjidtv.id`)
- Data terpisah (events, donations, dll)

## Arsitektur

### Database
- Tambah `mosques` table sebagai master
- Semua tabel lain (events, donations, dll) pakai `mosque_id` FK
- Supabase RLS policy per `mosque_id`

### Auth & Roles
- **Super Admin** — register masjid baru, manage akses
- **Masjid Admin** — kelola data masjid sendiri saja
- Auth via Supabase Auth, user metadata simpan `mosque_id`

### Routing
- **Option A:** Subdomain → `assyams.masjidtv.id/tv`
- **Option B:** Slug → `masjidtv.id/assyams/tv`
- Middleware detect tenant → inject `mosque_id` ke context

### Branding / Theme Engine
- Per-masjid color theme disimpan di DB:
  - `primary_color`, `accent_color`, `header_gradient`, dll
- Server inject CSS variables di `<head>` berdasarkan tenant config
- Storage: `uploads/{mosque_id}/` folder terpisah

### Migration Path (dari single ke multi)
1. Buat `mosques` table
2. Tambah `mosque_id` ke semua tabel existing
3. Migrate data existing ke 1 mosque record
4. Tambah middleware tenant detection
5. Update semua query pakai `mosque_id` filter
6. Buat super admin dashboard
7. Buat theme engine

## Referensi File Utama (saat ini)
- Schema: `supabase/schema.sql`
- Config: `src/app/api/config/route.ts`
- Auth: `src/middleware.ts`
- TV: `src/app/tv/page.tsx`
- Admin: `src/app/admin/settings/page.tsx`

-- ═══════════════════════════════════════════════
-- Masjid TV App — Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Mosque config (single row for MVP)
CREATE TABLE mosque_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Masjid AS-SYAMS',
  tagline TEXT DEFAULT 'Menerangi Hati, Menghidupkan Sunnah',
  logo_url TEXT,
  qris_url TEXT,
  city TEXT DEFAULT 'Jakarta',
  country TEXT DEFAULT 'ID',
  latitude DECIMAL DEFAULT -6.2088,
  longitude DECIMAL DEFAULT 106.8456,
  calculation_method INT DEFAULT 20,
  -- Fullscreen slide settings
  fullscreen_interval INT DEFAULT 5,    -- every X minutes, go fullscreen
  fullscreen_duration INT DEFAULT 30,   -- fullscreen duration in seconds
  -- Prayer blank screen duration (minutes after iqamah)
  prayer_duration_subuh INT DEFAULT 15,
  prayer_duration_dzuhur INT DEFAULT 15,
  prayer_duration_ashar INT DEFAULT 15,
  prayer_duration_maghrib INT DEFAULT 10,
  prayer_duration_isya INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prayer times (manual override + iqamah offsets)
CREATE TABLE prayer_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  subuh TIME, dzuhur TIME, ashar TIME, maghrib TIME, isya TIME,
  iqamah_subuh INT DEFAULT 10,
  iqamah_dzuhur INT DEFAULT 10,
  iqamah_ashar INT DEFAULT 10,
  iqamah_maghrib INT DEFAULT 5,
  iqamah_isya INT DEFAULT 10,
  is_manual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events / Kajian
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  speaker TEXT,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  template_type TEXT DEFAULT 'kajian_rutin',
  image_type TEXT DEFAULT 'preset',
  image_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Donations
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  image_url TEXT,
  target_amount BIGINT NOT NULL,
  collected_amount BIGINT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Finances (weekly/monthly snapshots)
CREATE TABLE finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  as_of_date DATE NOT NULL,
  label TEXT,
  total_income BIGINT DEFAULT 0,
  total_expense BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Announcements (running text)
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  icon TEXT DEFAULT '📢',
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hadiths / Quran
CREATE TABLE hadiths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- Enable Realtime on all tables
-- ═══════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE finances;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE hadiths;
ALTER PUBLICATION supabase_realtime ADD TABLE prayer_times;
ALTER PUBLICATION supabase_realtime ADD TABLE mosque_config;

-- ═══════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════
ALTER TABLE mosque_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access (TV display needs to read without auth)
CREATE POLICY "Public read" ON mosque_config FOR SELECT USING (true);
CREATE POLICY "Public read" ON prayer_times FOR SELECT USING (true);
CREATE POLICY "Public read" ON events FOR SELECT USING (true);
CREATE POLICY "Public read" ON donations FOR SELECT USING (true);
CREATE POLICY "Public read" ON finances FOR SELECT USING (true);
CREATE POLICY "Public read" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read" ON hadiths FOR SELECT USING (true);

-- Auth write access
CREATE POLICY "Auth write" ON mosque_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON prayer_times FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON donations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON finances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON announcements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON hadiths FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Auth update own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════════════
-- Seed Data
-- ═══════════════════════════════════════════════
INSERT INTO mosque_config (name, tagline, city, country, latitude, longitude, calculation_method)
VALUES ('Masjid AS-SYAMS', 'Menerangi Hati, Menghidupkan Sunnah', 'Jakarta', 'ID', -6.2088, 106.8456, 20);

INSERT INTO events (title, speaker, date, time, location, template_type, image_type, status) VALUES
('Tadabbur Surat Al-Mulk', 'Ust. Ahmad Fauzi, Lc.', CURRENT_DATE, 'Ba''da Maghrib', 'Ruang Utama Masjid Lt. 2', 'kajian_rutin', 'preset', 'active'),
('Sholat Jum''at', 'Ust. Ahmad Fauzi, Lc.', CURRENT_DATE + 1, '12.00 WIB', 'Area Utama Masjid', 'sholat_jumat', 'preset', 'active'),
('Fiqh Ibadah', 'Ust. Muhammad Nuzul', CURRENT_DATE + 3, 'Ba''da Isya', 'Ruang Utama Masjid Lt. 2', 'kajian_rutin', 'preset', 'active'),
('Aqidah Ahlus Sunnah', 'Ust. Abu Yahya', CURRENT_DATE + 7, 'Ba''da Ashar', 'Ruang Utama Masjid Lt. 2', 'kajian_spesial', 'preset', 'draft');

INSERT INTO donations (program_name, target_amount, collected_amount, status) VALUES
('Pembangunan Tempat Wudhu', 75000000, 32500000, 'active'),
('Renovasi Toilet Masjid', 50000000, 48000000, 'active'),
('Pengadaan Al-Quran', 15000000, 15000000, 'completed');

INSERT INTO finances (as_of_date, label, total_income, total_expense) VALUES
(CURRENT_DATE, 'April 2026', 12500000, 8200000);

INSERT INTO announcements (text, icon, sort_order, status) VALUES
('Kajian malam ini ba''da Maghrib bersama Ust. Ahmad Fauzi', '📖', 1, 'active'),
('Infak bisa melalui QRIS di samping', '💳', 2, 'active'),
('Jaga kebersihan masjid', '🧹', 3, 'active'),
('Matikan HP saat sholat', '📵', 4, 'active');

INSERT INTO hadiths (content, source, status) VALUES
('Sesungguhnya setiap amalan tergantung pada niatnya. Dan sesungguhnya setiap orang akan mendapatkan apa yang ia niatkan.', 'HR. Bukhari & Muslim', 'active'),
('Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.', 'HR. Ahmad', 'active'),
('Barangsiapa beriman kepada Allah dan hari akhir, maka hendaklah ia berkata baik atau diam.', 'HR. Bukhari & Muslim', 'active');

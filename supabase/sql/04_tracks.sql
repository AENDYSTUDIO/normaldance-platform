CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration TEXT,
  cover_url TEXT,
  audio_url TEXT,
  plays BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  is_nft BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON tracks
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON tracks
  FOR INSERT TO authenticated WITH CHECK (true);

-- User interactions for social features
CREATE TABLE user_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, track_id)
);

-- User follows for social networking
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Track comments
CREATE TABLE track_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User listening history for recommendations
CREATE TABLE listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  duration_played INTEGER, -- in seconds
  completed BOOLEAN DEFAULT false
);

-- Track genres for better categorization
CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1'
);

-- Track genres junction table
CREATE TABLE track_genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE(track_id, genre_id)
);

-- User favorite genres for recommendations
CREATE TABLE user_favorite_genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  weight DECIMAL(3,2) DEFAULT 1.0, -- how much user likes this genre (0.0-1.0)
  UNIQUE(user_id, genre_id)
);

-- Enable RLS
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_genres ENABLE ROW LEVEL SECURITY;

-- Policies for user likes
CREATE POLICY "Users can view all likes" ON user_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON user_likes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Policies for user follows
CREATE POLICY "Users can view all follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON user_follows FOR ALL TO authenticated USING (auth.uid() = follower_id);

-- Policies for track comments
CREATE POLICY "Users can view all comments" ON track_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON track_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON track_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON track_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for listening history
CREATE POLICY "Users can manage own listening history" ON listening_history FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Policies for track genres
CREATE POLICY "Users can view track genres" ON track_genres FOR SELECT USING (true);

-- Policies for user favorite genres
CREATE POLICY "Users can manage own favorite genres" ON user_favorite_genres FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_track_id ON user_likes(track_id);
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX idx_track_comments_track_id ON track_comments(track_id);
CREATE INDEX idx_track_comments_user_id ON track_comments(user_id);
CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_track_id ON listening_history(track_id);
CREATE INDEX idx_listening_history_played_at ON listening_history(played_at);
CREATE INDEX idx_track_genres_track_id ON track_genres(track_id);
CREATE INDEX idx_track_genres_genre_id ON track_genres(genre_id);

-- Insert default genres
INSERT INTO genres (name, description, color) VALUES
('Electronic', 'Electronic music including house, techno, dubstep', '#00D4FF'),
('Hip Hop', 'Hip hop, rap and trap music', '#FF6B35'),
('Rock', 'Rock music in all its forms', '#E74C3C'),
('Pop', 'Popular music and chart hits', '#F39C12'),
('Jazz', 'Jazz and blues music', '#3498DB'),
('Classical', 'Classical and orchestral music', '#9B59B6'),
('R&B', 'Rhythm and blues music', '#E91E63'),
('Country', 'Country and folk music', '#27AE60'),
('Metal', 'Metal and heavy music', '#34495E'),
('Reggae', 'Reggae and Caribbean music', '#F1C40F');

-- Function to update track likes count
CREATE OR REPLACE FUNCTION update_track_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tracks SET likes = likes + 1 WHERE id = NEW.track_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tracks SET likes = likes - 1 WHERE id = OLD.track_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count
CREATE TRIGGER update_track_likes_count_trigger
  AFTER INSERT OR DELETE ON user_likes
  FOR EACH ROW EXECUTE FUNCTION update_track_likes_count();

-- Function to update track plays count
CREATE OR REPLACE FUNCTION update_track_plays_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true THEN
    UPDATE tracks SET plays = plays + 1 WHERE id = NEW.track_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for plays count
CREATE TRIGGER update_track_plays_count_trigger
  AFTER INSERT ON listening_history
  FOR EACH ROW EXECUTE FUNCTION update_track_plays_count();
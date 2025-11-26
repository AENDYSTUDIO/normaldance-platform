import { createClient } from '@supabase/supabase-js';
import { Track } from '../types';

// Initialize Supabase client (graceful fallback if env not set)
const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isNonEmpty = (v?: string) => typeof v === 'string' && v.trim().length > 0;
const isValidHttpUrl = (v?: string) => {
  if (!isNonEmpty(v)) return false;
  try {
    const u = new URL(v as string);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
};

const hasSupabaseEnv = isValidHttpUrl(rawUrl) && isNonEmpty(rawKey);

export const supabase = hasSupabaseEnv ? createClient(rawUrl!.trim(), rawKey!.trim()) : null as any;
if (!hasSupabaseEnv) {
  console.warn('[Supabase] Not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase features.');
}

// Database Types
export interface DbTrack {
    id: string;
    title: string;
    artist: string;
    duration: string;
    cover_url: string;
    audio_url: string;
    plays: number;
    likes: number;
    is_nft: boolean;
    created_at: string;
    description?: string;
    ipfs_hash?: string;
    user_id?: string;
}

// Tracks Service
export const tracksService = {
    // Get all tracks
    async getAllTracks(): Promise<Track[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tracks:', error);
            return [];
        }

        return data.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            duration: track.duration,
            coverUrl: track.cover_url,
            audioUrl: track.audio_url,
            plays: track.plays,
            likes: track.likes,
            isNft: track.is_nft,
            dateAdded: track.created_at,
            description: track.description,
        }));
    },

    // Add a new track
    async addTrack(track: Omit<DbTrack, 'id' | 'created_at'>): Promise<Track | null> {
        if (!supabase) {
            console.warn('Supabase is not configured. Skipping DB insert and returning null.');
            return null;
        }
        const { data, error } = await supabase
            .from('tracks')
            .insert([{
                title: track.title,
                artist: track.artist,
                duration: track.duration,
                cover_url: track.cover_url,
                audio_url: track.audio_url,
                plays: track.plays || 0,
                likes: track.likes || 0,
                is_nft: track.is_nft || false,
                description: track.description,
                ipfs_hash: track.ipfs_hash,
                user_id: track.user_id,
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding track:', error);
            return null;
        }

        return {
            id: data.id,
            title: data.title,
            artist: data.artist,
            duration: data.duration,
            coverUrl: data.cover_url,
            audioUrl: data.audio_url,
            plays: data.plays,
            likes: data.likes,
            isNft: data.is_nft,
            dateAdded: data.created_at,
            description: data.description,
        };
    },

    // Update track
    async updateTrack(id: string, updates: Partial<DbTrack>): Promise<boolean> {
        if (!supabase) return false;
        const { error } = await supabase
            .from('tracks')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating track:', error);
            return false;
        }
        return true;
    },

    // Increment plays
    async incrementPlays(id: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase.rpc('increment_plays', { track_id: id });
        if (error) console.error('Error incrementing plays:', error);
    },

    // Toggle like
    async toggleLike(id: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase.rpc('increment_likes', { track_id: id });
        if (error) console.error('Error toggling like:', error);
    },

    // Upload audio file to Supabase Storage
    async uploadAudioFile(file: File, trackId: string): Promise<string | null> {
        if (!supabase) return null;
        const fileName = `${trackId}-${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
            .from('audio-files')
            .upload(fileName, file);

        if (error) {
            console.error('Error uploading audio file:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('audio-files')
            .getPublicUrl(fileName);

        return publicUrl;
    },

    // Upload cover image to Supabase Storage
    async uploadCoverImage(file: File, trackId: string): Promise<string | null> {
        if (!supabase) return null;
        const fileName = `${trackId}-${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
            .from('cover-images')
            .upload(fileName, file);

        if (error) {
            console.error('Error uploading cover image:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('cover-images')
            .getPublicUrl(fileName);

        return publicUrl;
    },
};

// Auth Service
export const authService = {
    // Sign up with email
    async signUp(email: string, password: string) {
        if (!supabase) return { data: {}, error: { message: 'Supabase not configured' } as any };
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
    },

    // Sign in with email
    async signIn(email: string, password: string) {
        if (!supabase) return { data: {}, error: { message: 'Supabase not configured' } as any };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    },

    // Sign out
    async signOut() {
        if (!supabase) return { error: null };
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current user
    async getCurrentUser() {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (user: any) => void) {
        if (!supabase) return { data: null, error: null } as any;
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user || null);
        });
    },
};

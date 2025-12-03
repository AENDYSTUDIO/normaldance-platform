// Social features and user interactions types

import { Track } from '../types';

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  user_id: string;
  is_public: boolean;
  tracks_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  added_by: string;
  added_at: string;
  position: number;
  track?: Track;
}

export interface UserLike {
  id: string;
  user_id: string;
  track_id: string;
  created_at: string;
  track?: Track;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: User;
  following?: User;
}

export interface TrackComment {
  id: string;
  track_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface ListeningHistory {
  id: string;
  user_id: string;
  track_id: string;
  played_at: string;
  duration_played?: number;
  completed: boolean;
  track?: Track;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export interface TrackGenre {
  id: string;
  track_id: string;
  genre_id: string;
  genre?: Genre;
}

export interface UserFavoriteGenre {
  id: string;
  user_id: string;
  genre_id: string;
  weight: number;
  genre?: Genre;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  genres?: string[];
  artist?: string;
  duration_min?: number;
  duration_max?: number;
  date_range?: {
    start: string;
    end: string;
  };
  sort_by?: 'relevance' | 'plays' | 'likes' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult {
  tracks: Track[];
  playlists: Playlist[];
  users: User[];
  total: number;
  has_more: boolean;
}

// Recommendation types
export interface RecommendationOptions {
  based_on: 'listening_history' | 'favorites' | 'similar_users' | 'genres';
  limit?: number;
  exclude_recent?: boolean;
  time_range?: number; // days
}

export interface Recommendation {
  track: Track;
  score: number;
  reason: string;
  similar_tracks?: Track[];
}

// User profile statistics
export interface UserStats {
  total_plays: number;
  total_likes: number;
  total_comments: number;
  playlists_created: number;
  followers_count: number;
  following_count: number;
  favorite_genres: Array<{
    genre: Genre;
    count: number;
  }>;
  listening_time: number; // in minutes
  top_tracks: Track[];
}
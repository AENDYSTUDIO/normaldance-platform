import React from 'react';
import { Play, Pause, Heart, MoreVertical, Share2, Download } from 'lucide-react';
import {
  LazyMotionDiv,
  variants,
  springPresets,
  durationPresets,
  easingPresets
} from './AnimatedMotion';

interface AnimatedCardProps {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration?: number;
  plays?: number;
  isPlaying?: boolean;
  isLiked?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  className?: string;
  index?: number;
}

// Main animated track card
export const AnimatedTrackCard: React.FC<AnimatedCardProps> = ({
  id,
  title,
  artist,
  coverUrl,
  duration,
  plays,
  isPlaying = false,
  isLiked = false,
  onPlay,
  onLike,
  className = '',
  index = 0
}) => {
  return (
    <LazyMotionDiv
      className={`glass-panel rounded-xl p-4 cursor-pointer group ${className}`}
      variants={variants.card}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={springPresets.gentle}
      style={{
        animationDelay: `${index * 0.05}s`
      }}
    >
      <div className="relative">
        {/* Cover Image with overlay effects */}
        <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <LazyMotionDiv
              className="bg-violet-500 rounded-full p-3 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={springPresets.bouncy}
            >
              {isPlaying ? (
                <Pause size={24} className="text-white" />
              ) : (
                <Play size={24} className="text-white ml-1" />
              )}
            </LazyMotionDiv>
          </div>

          {/* Now playing indicator */}
          {isPlaying && (
            <LazyMotionDiv
              className="absolute top-2 right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springPresets.bouncy}
            >
              <div className="bg-violet-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span>Now Playing</span>
              </div>
            </LazyMotionDiv>
          )}
        </div>

        {/* Track info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-violet-300 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-1 group-hover:text-gray-300 transition-colors duration-200">
            {artist}
          </p>

          {/* Metadata */}
          {(duration || plays) && (
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              {duration && (
                <span>{formatDuration(duration)}</span>
              )}
              {plays && (
                <span>{formatPlays(plays)} plays</span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <LazyMotionDiv
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, ...springPresets.gentle }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <Heart
                size={16}
                className={isLiked ? 'text-violet-400 fill-violet-400' : 'text-gray-400'}
              />
            </button>
            <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <Share2 size={16} className="text-gray-400" />
            </button>
          </LazyMotionDiv>

          <LazyMotionDiv
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, ...springPresets.gentle }}
          >
            <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          </LazyMotionDiv>
        </div>
      </div>
    </LazyMotionDiv>
  );
};

// Compact track card for lists
export const AnimatedCompactTrack: React.FC<AnimatedCardProps & {
  showIndex?: boolean;
  index?: number;
}> = ({
  id,
  title,
  artist,
  coverUrl,
  duration,
  plays,
  isPlaying = false,
  isLiked = false,
  onPlay,
  onLike,
  showIndex = false,
  index = 0
}) => {
  return (
    <LazyMotionDiv
      className="flex items-center p-3 rounded-lg hover:bg-white/5 group cursor-pointer transition-all duration-200"
      variants={variants.listItem}
      initial="initial"
      animate="animate"
      whileHover={{ x: 5 }}
      transition={springPresets.smooth}
    >
      {/* Index number */}
      {showIndex && (
        <span className="text-gray-500 text-sm w-8 text-center font-mono">
          {index + 1}
        </span>
      )}

      {/* Cover image */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden mr-3">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {isPlaying && (
          <LazyMotionDiv
            className="absolute inset-0 bg-violet-500/80 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springPresets.bouncy}
          >
            <Pause size={16} className="text-white" />
          </LazyMotionDiv>
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium line-clamp-1 group-hover:text-violet-300 transition-colors duration-200">
          {title}
        </h4>
        <p className="text-gray-400 text-xs line-clamp-1">
          {artist}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <LazyMotionDiv whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            className="p-1"
          >
            <Heart
              size={16}
              className={isLiked ? 'text-violet-400 fill-violet-400' : 'text-gray-400'}
            />
          </button>
        </LazyMotionDiv>

        {duration && (
          <span className="text-gray-500 text-xs font-mono min-w-[40px] text-right">
            {formatDuration(duration)}
          </span>
        )}
      </div>
    </LazyMotionDiv>
  );
};

// Playlist card component
export const AnimatedPlaylistCard: React.FC<{
  id: string;
  name: string;
  trackCount: number;
  coverUrls: string[];
  isOwner?: boolean;
  onClick?: () => void;
  className?: string;
  index?: number;
}> = ({
  id,
  name,
  trackCount,
  coverUrls,
  isOwner = false,
  onClick,
  className = '',
  index = 0
}) => {
  // Show up to 4 cover images in a grid
  const displayCovers = coverUrls.slice(0, 4);
  const hasMore = coverUrls.length > 4;

  return (
    <LazyMotionDiv
      className={`glass-panel rounded-xl p-4 cursor-pointer group ${className}`}
      variants={variants.card}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={springPresets.gentle}
      style={{
        animationDelay: `${index * 0.05}s`
      }}
      onClick={onClick}
    >
      {/* Cover images grid */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-dark-800">
        <div className="grid grid-cols-2 gap-0.5 h-full">
          {displayCovers.map((cover, i) => (
            <LazyMotionDiv
              key={i}
              className="relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={springPresets.smooth}
            >
              <img
                src={cover}
                alt={`${name} track ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {hasMore && i === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    +{coverUrls.length - 4}
                  </span>
                </div>
              )}
            </LazyMotionDiv>
          ))}
        </div>

        {/* Owner badge */}
        {isOwner && (
          <LazyMotionDiv
            className="absolute top-2 right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, ...springPresets.bouncy }}
          >
            <div className="bg-violet-500 text-white text-xs px-2 py-1 rounded-full">
              Owner
            </div>
          </LazyMotionDiv>
        )}
      </div>

      {/* Playlist info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-violet-300 transition-colors duration-200">
          {name}
        </h3>
        <p className="text-gray-400 text-xs">
          {trackCount} tracks
        </p>
      </div>
    </LazyMotionDiv>
  );
};

// Utility functions
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatPlays = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
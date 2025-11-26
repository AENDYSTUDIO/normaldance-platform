import React, { useState, useRef, useEffect } from 'react';
import {
    Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
    Repeat, Repeat1, Shuffle, Heart
} from 'lucide-react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useTracksStore } from '../stores/useTracksStore';
import { motion, AnimatePresence } from 'framer-motion';

export const PlayerBar: React.FC = () => {
    const {
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        repeat,
        shuffle,
        togglePlay,
        setVolume,
        setCurrentTime,
        next,
        previous,
        toggleRepeat,
        toggleShuffle
    } = usePlayerStore();

    const { likeTrack } = useTracksStore();
    const [isDraggingSeek, setIsDraggingSeek] = useState(false);
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(volume);

    const seekBarRef = useRef<HTMLDivElement>(null);
    const volumeBarRef = useRef<HTMLDivElement>(null);

    const formatTime = (seconds: number): string => {
        if (!seconds || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeekMouseDown = () => setIsDraggingSeek(true);

    const handleSeekMouseUp = () => setIsDraggingSeek(false);

    const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!seekBarRef.current || !duration) return;
        const rect = seekBarRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        setCurrentTime(newTime);
    };

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!volumeBarRef.current) return;
        const rect = volumeBarRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(percent);
        if (percent > 0) setIsMuted(false);
    };

    const toggleMute = () => {
        if (isMuted) {
            setVolume(previousVolume || 0.7);
            setIsMuted(false);
        } else {
            setPreviousVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
    };

    const handleLike = () => {
        if (currentTrack) {
            likeTrack(currentTrack.id);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingSeek && seekBarRef.current && duration) {
                const rect = seekBarRef.current.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setCurrentTime(percent * duration);
            }
            if (isDraggingVolume && volumeBarRef.current) {
                const rect = volumeBarRef.current.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setVolume(percent);
            }
        };

        const handleMouseUp = () => {
            setIsDraggingSeek(false);
            setIsDraggingVolume(false);
        };

        if (isDraggingSeek || isDraggingVolume) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDraggingSeek, isDraggingVolume, duration, setCurrentTime, setVolume]);

    if (!currentTrack) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                transition={{ type: 'spring', damping: 20 }}
                className="h-24 glass-panel border-t border-white/10 flex items-center justify-between px-6 z-40 relative"
            >
                {/* Track Info */}
                <div className="flex items-center space-x-4 w-1/4 min-w-0">
                    <div className="relative group">
                        <img
                            src={currentTrack.coverUrl}
                            alt="Cover"
                            className="w-14 h-14 rounded-lg object-cover shadow-lg"
                        />
                        {currentTrack.isNft && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full border-2 border-dark-900 flex items-center justify-center">
                                <span className="text-[8px]">💎</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-semibold truncate">
                            {currentTrack.title}
                        </h4>
                        <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
                    </div>
                    <button
                        onClick={handleLike}
                        className="text-gray-400 hover:text-pink-500 transition opacity-0 group-hover:opacity-100"
                    >
                        <Heart size={18} />
                    </button>
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center flex-1 max-w-2xl px-4">
                    <div className="flex items-center space-x-4 mb-3">
                        {/* Shuffle */}
                        <button
                            onClick={toggleShuffle}
                            className={`transition ${shuffle ? 'text-violet-400' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Shuffle size={16} />
                        </button>

                        {/* Previous */}
                        <button
                            onClick={previous}
                            className="text-gray-400 hover:text-white transition hover:scale-110"
                        >
                            <SkipBack size={20} />
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white hover:bg-violet-400 hover:scale-110 transition shadow-lg shadow-violet-500/30"
                        >
                            {isPlaying ? (
                                <Pause size={20} fill="currentColor" />
                            ) : (
                                <Play size={20} fill="currentColor" className="ml-0.5" />
                            )}
                        </button>

                        {/* Next */}
                        <button
                            onClick={next}
                            className="text-gray-400 hover:text-white transition hover:scale-110"
                        >
                            <SkipForward size={20} />
                        </button>

                        {/* Repeat */}
                        <button
                            onClick={toggleRepeat}
                            className={`transition ${repeat !== 'off' ? 'text-violet-400' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center space-x-3">
                        <span className="text-xs text-gray-400 w-10 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <div
                            ref={seekBarRef}
                            onClick={handleSeekClick}
                            onMouseDown={handleSeekMouseDown}
                            onMouseUp={handleSeekMouseUp}
                            className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group relative"
                        >
                            <div
                                className="h-full bg-violet-500 rounded-full relative transition-all"
                                style={{ width: `${progress}%` }}
                            >
                                <div
                                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition ${isDraggingSeek ? 'opacity-100 scale-125' : ''
                                        }`}
                                />
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 w-10">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Volume Controls */}
                <div className="flex items-center justify-end space-x-3 w-1/4">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-white transition">
                        {isMuted || volume === 0 ? (
                            <VolumeX size={18} />
                        ) : (
                            <Volume2 size={18} />
                        )}
                    </button>
                    <div
                        ref={volumeBarRef}
                        onClick={handleVolumeClick}
                        onMouseDown={() => setIsDraggingVolume(true)}
                        className="w-24 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
                    >
                        <div
                            className="h-full bg-gray-400 rounded-full relative transition-all"
                            style={{ width: `${volume * 100}%` }}
                        >
                            <div
                                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition ${isDraggingVolume ? 'opacity-100 scale-125' : ''
                                    }`}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

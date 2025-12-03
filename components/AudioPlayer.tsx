import React, { useEffect, useRef, useState } from 'react';

import { usePlayerStore } from '../stores/usePlayerStore';
import { useTracksStore } from '../stores/useTracksStore';
import { useToastStore } from '../stores/useToastStore';
import { AudioVisualizer } from './AudioVisualizer';
import AudioEffects from './AudioEffects';
import { Settings, BarChart3, Headphones } from 'lucide-react';

export const AudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showEffects, setShowEffects] = useState(false);
    const [showVisualizer, setShowVisualizer] = useState(false);
    const [advancedMode, setAdvancedMode] = useState(false);

    const {
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        repeat,
        setCurrentTime,
        setDuration,
        pause,
        next
    } = usePlayerStore();

    const { incrementPlays } = useTracksStore();
    const { addToast } = useToastStore();

    // Handle play/pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch((error) => {
                console.error('Playback failed:', error);
                pause();
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, pause]);

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Handle track changes
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        // If there's no audioUrl, pause and warn
        if (!currentTrack.audioUrl) {
            console.warn('No audioUrl for current track:', currentTrack);
            addToast('No audio available for this track', 'warning');
            pause();
            return;
        }

        // Update audio source
        audioRef.current.src = currentTrack.audioUrl;
        audioRef.current.currentTime = 0;

        if (isPlaying) {
            audioRef.current.play().catch((err) => {
                console.error('Auto-play failed:', err);
                addToast('Autoplay failed. Click play to start.', 'warning');
                pause();
            });
        }

        // Increment play count when track starts
        if (currentTrack.id) {
            incrementPlays(currentTrack.id);
        }
    }, [currentTrack, incrementPlays, isPlaying, pause]);

    // Handle seeking
    useEffect(() => {
        if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
            audioRef.current.currentTime = currentTime;
        }
    }, [currentTime]);

    // Event handlers
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        if (repeat === 'one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else {
            next();
        }
    };

    const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
        console.error('Audio error:', e);
        addToast('Audio playback error', 'error');
    };

    if (!currentTrack) return null;

    return (
        <>
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onError={handleError}
                preload="metadata"
            />

            {/* Advanced Audio Controls */}
            <div className="fixed top-4 left-4 z-40 flex flex-col gap-2">
                {/* Advanced Mode Toggle */}
                <button
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className={`glass-panel p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                        advancedMode ? 'bg-violet-500/20 shadow-lg shadow-violet-500/20' : 'hover:bg-white/10'
                    }`}
                    aria-label="Toggle Advanced Audio Mode"
                >
                    <Settings className="w-4 h-4" />
                </button>

                {advancedMode && (
                    <>
                        {/* Audio Effects Button */}
                        <button
                            onClick={() => setShowEffects(true)}
                            className="glass-panel p-3 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
                            aria-label="Open Audio Effects"
                        >
                            <BarChart3 className="w-4 h-4" />
                        </button>

                        {/* Visualizer Toggle */}
                        <button
                            onClick={() => setShowVisualizer(!showVisualizer)}
                            className={`glass-panel p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                                showVisualizer ? 'bg-violet-500/20 shadow-lg shadow-violet-500/20' : 'hover:bg-white/10'
                            }`}
                            aria-label="Toggle Audio Visualizer"
                        >
                            <Headphones className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            {/* Audio Visualizer */}
            {showVisualizer && currentTrack?.audioUrl && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 p-4 flex items-center justify-center">
                    <div className="glass-panel p-8 rounded-3xl max-w-6xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-2xl bg-violet-500/20">
                                    <Headphones className="w-6 h-6 text-violet-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Audio Visualizer</h2>
                            </div>
                            <button
                                onClick={() => setShowVisualizer(false)}
                                className="glass-panel p-3 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
                                aria-label="Close Audio Visualizer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <AudioVisualizer />
                    </div>
                </div>
            )}

            {/* Audio Effects Modal */}
            {showEffects && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 p-4 flex items-center justify-center">
                    <div className="glass-panel p-8 rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-2xl bg-violet-500/20">
                                    <BarChart3 className="w-6 h-6 text-violet-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Audio Effects</h2>
                            </div>
                            <button
                                onClick={() => setShowEffects(false)}
                                className="glass-panel p-3 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
                                aria-label="Close Audio Effects"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <AudioEffects />
                    </div>
                </div>
            )}

            {/* Advanced Mode Indicator */}
            {advancedMode && (
                <div className="fixed bottom-20 right-4 glass-panel px-3 py-1 rounded-full text-xs text-violet-400 z-40">
                    Advanced Audio Active
                </div>
            )}
        </>
    );
};

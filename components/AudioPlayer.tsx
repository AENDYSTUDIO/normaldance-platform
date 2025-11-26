import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useTracksStore } from '../stores/useTracksStore';
import { useToastStore } from '../stores/useToastStore';

export const AudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);

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
        <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onError={handleError}
            preload="metadata"
        />
    );
};

/**
 * Audio Visualizer Component
 * Provides real-time audio visualization with frequency analysis
 */

import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';

interface BarProps {
  height: number;
  frequency: number;
  isActive: boolean;
}

const FrequencyBar: React.FC<BarProps> = ({ height, frequency, isActive }) => {
  const getColor = () => {
    if (frequency > 20000) return 'bg-red-500';
    if (frequency > 10000) return 'bg-orange-500';
    if (frequency > 5000) return 'bg-yellow-500';
    if (frequency > 2500) return 'bg-green-500';
    if (frequency > 1250) return 'bg-blue-500';
    return 'bg-purple-500';
  };

  return (
    <div
      className={`flex-1 mx-px rounded-t-sm transition-all duration-75 ${
        isActive ? getColor() : 'bg-gray-600'
      }`}
      style={{ height: `${height}%` }}
    />
  );
};

export const AudioVisualizer: React.FC = () => {
  const { currentTrack, isPlaying } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!currentTrack?.audioUrl || !canvasRef.current) return;

    const initVisualizer = async () => {
      try {
        // Create audio context and analyser
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioElement = new Audio(currentTrack.audioUrl);

        const source = audioContext.createMediaElementSource(audioElement);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyserRef.current = analyser;

        // Set up canvas
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = canvas.offsetWidth * window.devicePixelRatio;
          canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio visualizer:', error);
      }
    };

    initVisualizer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [currentTrack?.audioUrl]);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = canvas.width / bufferLength;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(17, 24, 39, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);

        if (dataArray[i] > 200) {
          gradient.addColorStop(0, 'rgb(239, 68, 68)');
          gradient.addColorStop(1, 'rgb(185, 28, 28)');
        } else if (dataArray[i] > 150) {
          gradient.addColorStop(0, 'rgb(251, 146, 60)');
          gradient.addColorStop(1, 'rgb(217, 119, 6)');
        } else if (dataArray[i] > 100) {
          gradient.addColorStop(0, 'rgb(250, 204, 21)');
          gradient.addColorStop(1, 'rgb(202, 138, 4)');
        } else if (dataArray[i] > 50) {
          gradient.addColorStop(0, 'rgb(74, 222, 128)');
          gradient.addColorStop(1, 'rgb(34, 197, 94)');
        } else {
          gradient.addColorStop(0, 'rgb(147, 51, 234)');
          gradient.addColorStop(1, 'rgb(88, 28, 135)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  if (!currentTrack?.audioUrl) {
    return (
      <div className="h-16 flex items-center justify-center">
        <div className="text-gray-400 text-sm">No audio playing</div>
      </div>
    );
  }

  return (
    <div className="relative h-16 w-full bg-dark-800/50 rounded-lg overflow-hidden">
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
          <div className="text-white text-sm">Initializing visualizer...</div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isPlaying ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Frequency indicators */}
      <div className="absolute bottom-0 left-0 right-0 h-2 flex">
        {[20, 500, 2000, 8000, 16000].map((freq, index) => (
          <div
            key={freq}
            className="flex-1 text-xs text-gray-400 text-center border-l border-gray-600 first:border-l-0"
          >
            {freq >= 1000 ? `${freq / 1000}k` : freq}Hz
          </div>
        ))}
      </div>
    </div>
  );
};
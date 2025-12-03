/**
 * Audio Effects Panel - Simplified Version
 * Provides equalizer and audio effects controls
 */

import React, { useState, useEffect } from 'react';

interface EqualizerBand {
  frequency: number;
  gain: number;
  label: string;
}

interface AudioEffect {
  id: string;
  name: string;
  enabled: boolean;
}

interface AudioEffectsProps {
  className?: string;
}

const AudioEffects: React.FC<AudioEffectsProps> = ({ className = '' }) => {
  const [bands, setBands] = useState<EqualizerBand[]>([
    { frequency: 60, gain: 0, label: '60Hz' },
    { frequency: 250, gain: 0, label: '250Hz' },
    { frequency: 1000, gain: 0, label: '1kHz' },
    { frequency: 4000, gain: 0, label: '4kHz' },
    { frequency: 12000, gain: 0, label: '12kHz' },
  ]);

  const [effects, setEffects] = useState<AudioEffect[]>([
    { id: 'reverb', name: 'Reverb', enabled: false },
    { id: 'echo', name: 'Echo', enabled: false },
    { id: 'bass-boost', name: 'Bass Boost', enabled: false },
  ]);

  const updateBand = (index: number, gain: number) => {
    setBands(prevBands => {
      const newBands = [...prevBands];
      newBands[index] = { ...newBands[index], gain };
      return newBands;
    });
  };

  const toggleEffect = (effectId: string) => {
    setEffects(prevEffects =>
      prevEffects.map(effect =>
        effect.id === effectId
          ? { ...effect, enabled: !effect.enabled }
          : effect
      )
    );
  };

  const getBandColor = (gain: number) => {
    if (Math.abs(gain) > 6) return 'bg-red-500/20';
    if (Math.abs(gain) > 3) return 'bg-yellow-500/20';
    return 'bg-green-500/20';
  };

  const getBandHeight = (gain: number) => {
    return Math.max(20, Math.abs(gain) * 20);
  };

  return (
    <div className={`glass-panel p-6 rounded-xl ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Audio Effects</h2>
        <p className="text-sm text-gray-400">Adjust equalizer and effects</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Equalizer</h3>
          <div className="flex justify-between items-end h-32 mb-2">
            {bands.map((band, index) => (
              <div key={band.frequency} className="flex-1 mx-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t-sm transition-all duration-200 ${getBandColor(band.gain)}`}
                  style={{ height: `${getBandHeight(band.gain)}px` }}
                />
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={band.gain}
                  onChange={(e) => updateBand(index, parseFloat(e.target.value))}
                  className="w-full mt-2 cursor-pointer"
                />
                <div className="text-xs text-gray-400 mt-1">{band.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Audio Effects</h3>
          <div className="grid grid-cols-1 gap-3">
            {effects.map(effect => (
              <button
                key={effect.id}
                onClick={() => toggleEffect(effect.id)}
                className={`p-3 rounded-lg transition-colors text-left flex items-center justify-between ${
                  effect.enabled
                    ? 'bg-violet-600/20 text-violet-400 border border-violet-600/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="font-medium">{effect.name}</span>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  effect.enabled
                    ? 'bg-violet-600'
                    : 'bg-gray-600'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    effect.enabled
                      ? 'translate-x-6'
                      : 'translate-x-0'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioEffects;
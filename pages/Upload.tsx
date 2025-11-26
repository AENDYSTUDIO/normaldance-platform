
import React, { useState, useRef } from 'react';
import { UploadCloud, Music, X, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Track } from '../types';
// Defer heavy services to interaction-time to reduce initial bundle size
// import { ipfsService } from '../services/ipfs';
// import { tracksService } from '../services/supabase';
import { useTracksStore } from '../stores/useTracksStore';
import { useAuthStore } from '../stores/useAuthStore';

export const Upload: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [isNft, setIsNft] = useState(false);

  const { addTrack } = useTracksStore();
  const { user } = useAuthStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAudioFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
      } else {
        alert("Please upload an image file");
      }
    }
  };

  const processAudioFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith('audio/')) {
      setAudioFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, "")); // Remove extension
      setArtist(user?.username || "Unknown Artist");
    } else {
      alert("Please upload an audio file");
    }
  };

  const handleSubmit = async () => {
    if (!audioFile || !title || !artist) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Upload to IPFS
      setUploadProgress('Uploading to IPFS...');

      const { ipfsService } = await import('../services/ipfs');
      const ipfsResult = await ipfsService.uploadTrackWithMetadata(audioFile, {
        title,
        artist,
        description,
        coverImage: coverFile || undefined,
      });

      if (!ipfsResult) {
        throw new Error('Failed to upload to IPFS');
      }

      // Step 2: Generate audio duration (mock for now)
      const duration = await getAudioDuration(audioFile);

      // Step 3: Save to Supabase
      setUploadProgress('Saving to database...');

      const coverUrl = ipfsResult.coverUrl || coverPreview || `https://picsum.photos/300/300?random=${Date.now()}`;

      const { tracksService } = await import('../services/supabase');
      const newTrack = await tracksService.addTrack({
        title,
        artist,
        duration,
        cover_url: coverUrl,
        audio_url: ipfsResult.audioUrl,
        plays: 0,
        likes: 0,
        is_nft: isNft,
        description,
        ipfs_hash: ipfsResult.audioHash,
        user_id: user?.id,
      });

      if (newTrack) {
        // Update local store
        addTrack(newTrack);

        setUploadProgress('Upload complete!');

        // Reset form
        setTimeout(() => {
          resetForm();
          setIsUploading(false);
          setUploadProgress('');
        }, 1500);
      } else {
        throw new Error('Failed to save track');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload track. Please try again.');
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      const url = URL.createObjectURL(file);
      audio.src = url;

      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        URL.revokeObjectURL(url);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve('3:45'); // Fallback duration
      });
    });
  };

  const resetForm = () => {
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setTitle('');
    setArtist('');
    setDescription('');
    setIsNft(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-white">Upload Music</h2>
        <p className="text-gray-400 mt-2">Publish your tracks to IPFS and mint them as NFTs.</p>
      </div>

      {!audioFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => audioFileInputRef.current?.click()}
          className={`glass-panel border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition cursor-pointer group ${isDragging ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:bg-white/5'}`}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition mb-6 ${isDragging ? 'bg-violet-500 text-white' : 'bg-violet-600/20 text-violet-400 group-hover:scale-110'}`}>
            <UploadCloud size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Drag & Drop your audio file</h3>
          <p className="text-gray-500">Supports WAV, MP3, FLAC (Max 100MB)</p>
          <input
            ref={audioFileInputRef}
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={handleAudioChange}
          />
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-violet-500/30 bg-violet-500/5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white">
              <Music size={24} />
            </div>
            <div>
              <p className="font-bold text-white">{audioFile.name}</p>
              <p className="text-xs text-violet-300">{(audioFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      )}

      <div className={`glass-panel p-8 rounded-2xl space-y-6 transition-opacity ${!audioFile ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Cover Image (Optional)</label>
          <div className="flex items-center space-x-4">
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="w-20 h-20 rounded-xl object-cover" />
            )}
            <button
              type="button"
              onClick={() => coverFileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition"
            >
              <ImageIcon size={18} />
              <span>{coverFile ? 'Change Cover' : 'Upload Cover'}</span>
            </button>
            <input
              ref={coverFileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleCoverChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Track Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none transition"
              placeholder="Enter title"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Artist Name *</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none transition"
              placeholder="Enter artist"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none h-32 transition resize-none"
            placeholder="Tell your story..."
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="mint"
              checked={isNft}
              onChange={(e) => setIsNft(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 text-violet-600 focus:ring-violet-500 bg-gray-800"
            />
            <label htmlFor="mint" className="text-white text-sm font-medium cursor-pointer">Mint as NFT</label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-violet-600/20 flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{uploadProgress}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Publish Track</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

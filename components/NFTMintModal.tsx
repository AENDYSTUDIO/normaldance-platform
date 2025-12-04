import React, { useState, useCallback } from 'react';
import {
  X,
  Upload,
  Music,
  Image,
  DollarSign,
  Disc,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  GasPump
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { contractService, NFTMetadata, MintOptions } from '../services/contracts';
import { ipfsService } from '../services/ipfs';
import { enhancedWeb3Service, ProgressCallback } from '../services/enhancedWeb3Service';
import { useToastStore } from '../stores/useToastStore';
import { useAuthStore } from '../stores/useAuthStore';

interface NFTMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string, tokenId: number) => void;
}

interface MintProgress {
  audio: { status: 'idle' | 'uploading' | 'completed' | 'error'; progress: number };
  cover: { status: 'idle' | 'uploading' | 'completed' | 'error'; progress: number };
  metadata: { status: 'idle' | 'uploading' | 'completed' | 'error'; progress: number };
  blockchain: { status: 'idle' | 'estimating' | 'pending' | 'completed' | 'error'; progress: number };
}

export const NFTMintModal: React.FC<NFTMintModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: 'Electronic',
    duration: 180, // 3 minutes default
    price: '0.1',
    royaltyPercentage: 10
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [progress, setProgress] = useState<MintProgress>({
    audio: { status: 'idle', progress: 0 },
    cover: { status: 'idle', progress: 0 },
    metadata: { status: 'idle', progress: 0 },
    blockchain: { status: 'idle', progress: 0 }
  });
  const [gasEstimate, setGasEstimate] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState<string>('');

  const { user } = useAuthStore();

  const handleAudioUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        useToastStore.getState().addToast('Audio file too large. Max size is 50MB', 'error');
        return;
      }
      setAudioFile(file);

      // Extract duration from audio file
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        setFormData(prev => ({
          ...prev,
          duration: Math.round(audio.duration)
        }));
      });
    } else {
      useToastStore.getState().addToast('Please upload a valid audio file', 'error');
    }
  }, []);

  const handleCoverUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        useToastStore.getState().addToast('Image file too large. Max size is 10MB', 'error');
        return;
      }
      setCoverImage(file);
    } else {
      useToastStore.getState().addToast('Please upload a valid image file', 'error');
    }
  }, []);

  const estimateGas = useCallback(async () => {
    if (!formData.title || !formData.artist || !audioFile || !coverImage) {
      return;
    }

    try {
      setProgress(prev => ({
        ...prev,
        blockchain: { status: 'estimating', progress: 0 }
      }));

      const metadata: NFTMetadata = {
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        duration: formData.duration,
        price: formData.price,
        royaltyPercentage: formData.royaltyPercentage,
        audioFile,
        coverImage
      };

      // Mock gas estimation - in real implementation this would call the contract
      const estimatedGas = '200000'; // Typical gas for NFT minting
      const gasPrice = await enhancedWeb3Service.optimizeGasPrice();
      const totalCost = (parseInt(estimatedGas) * parseInt(gasPrice)) / 1e18;

      setGasEstimate(estimatedGas);
      setEstimatedCost(totalCost.toFixed(6));

      setProgress(prev => ({
        ...prev,
        blockchain: { status: 'idle', progress: 100 }
      }));
    } catch (error) {
      console.error('Gas estimation failed:', error);
      setProgress(prev => ({
        ...prev,
        blockchain: { status: 'error', progress: 0 }
      }));
    }
  }, [formData, audioFile, coverImage]);

  const handleProgressCallback: ProgressCallback = useCallback((txProgress) => {
    const progressPercent = Math.min((txProgress.confirmations / 1) * 100, 100);

    setProgress(prev => ({
      ...prev,
      blockchain: {
        status: txProgress.status === 'confirmed' ? 'completed' :
                txProgress.status === 'failed' ? 'error' : 'pending',
        progress: progressPercent
      }
    }));

    if (txProgress.status === 'confirmed') {
      useToastStore.getState().addToast('NFT minted successfully!', 'success');
    } else if (txProgress.status === 'failed') {
      useToastStore.getState().addToast(`Minting failed: ${txProgress.error}`, 'error');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.artist.trim() || !audioFile || !coverImage) {
      useToastStore.getState().addToast('Please fill in all required fields', 'error');
      return;
    }

    if (!user?.address) {
      useToastStore.getState().addToast('Please connect your wallet first', 'error');
      return;
    }

    setIsMinting(true);
    setProgress({
      audio: { status: 'idle', progress: 0 },
      cover: { status: 'idle', progress: 0 },
      metadata: { status: 'idle', progress: 0 },
      blockchain: { status: 'idle', progress: 0 }
    });

    try {
      // Step 1: Upload audio file to IPFS
      setProgress(prev => ({
        ...prev,
        audio: { status: 'uploading', progress: 0 }
      }));

      let audioHash = '';
      try {
        const audioResult = await ipfsService.uploadFile(audioFile);
        if (audioResult) {
          audioHash = audioResult.hash;
          setProgress(prev => ({
            ...prev,
            audio: { status: 'completed', progress: 100 }
          }));
        } else {
          throw new Error('Audio upload failed');
        }
      } catch (error) {
        setProgress(prev => ({
          ...prev,
          audio: { status: 'error', progress: 0 }
        }));
        throw error;
      }

      // Step 2: Upload cover image to IPFS
      setProgress(prev => ({
        ...prev,
        cover: { status: 'uploading', progress: 0 }
      }));

      let coverHash = '';
      try {
        const coverResult = await ipfsService.uploadFile(coverImage);
        if (coverResult) {
          coverHash = coverResult.hash;
          setProgress(prev => ({
            ...prev,
            cover: { status: 'completed', progress: 100 }
          }));
        } else {
          throw new Error('Cover upload failed');
        }
      } catch (error) {
        setProgress(prev => ({
          ...prev,
          cover: { status: 'error', progress: 0 }
        }));
        throw error;
      }

      // Step 3: Prepare and upload metadata
      setProgress(prev => ({
        ...prev,
        metadata: { status: 'uploading', progress: 50 }
      }));

      const metadata: NFTMetadata = {
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        duration: formData.duration,
        price: formData.price,
        royaltyPercentage: formData.royaltyPercentage,
        audioHash,
        coverHash
      };

      // Generate metadata JSON
      const metadataJSON = contractService.generateNFTMetadata(audioFile, coverImage, metadata);
      const metadataBlob = new Blob([JSON.stringify(metadataJSON, null, 2)], {
        type: 'application/json',
      });
      const metadataFile = new File([metadataBlob], 'metadata.json', {
        type: 'application/json',
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const metadataResult = await ipfsService.uploadFile(metadataFile);
      if (!metadataResult) {
        setProgress(prev => ({
          ...prev,
          metadata: { status: 'error', progress: 0 }
        }));
        throw new Error('Metadata upload failed');
      }

      setProgress(prev => ({
        ...prev,
        metadata: { status: 'completed', progress: 100 }
      }));

      // Step 4: Mint NFT on blockchain
      setProgress(prev => ({
        ...prev,
        blockchain: { status: 'pending', progress: 10 }
      }));

      const mintOptions: MintOptions = {
        onProgress: handleProgressCallback,
        gasLimit: gasEstimate || '500000'
      };

      const finalMetadata: NFTMetadata = {
        ...metadata,
        audioFile,
        coverImage
      };

      const txHash = await contractService.mintMusicNFT(finalMetadata, mintOptions);

      // Simulate getting token ID (in real implementation, you'd get this from the event)
      const tokenId = Math.floor(Math.random() * 1000000);

      useToastStore.getState().addToast('NFT minted successfully!', 'success');

      // Call success callback
      onSuccess(txHash, tokenId);

      // Reset form
      setFormData({
        title: '',
        artist: '',
        genre: 'Electronic',
        duration: 180,
        price: '0.1',
        royaltyPercentage: 10
      });
      setAudioFile(null);
      setCoverImage(null);
      setGasEstimate('');
      setEstimatedCost('');

      onClose();

    } catch (error) {
      console.error('Minting failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      useToastStore.getState().addToast(`Minting failed: ${errorMessage}`, 'error');
    } finally {
      setIsMinting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetProgress = () => {
    setProgress({
      audio: { status: 'idle', progress: 0 },
      cover: { status: 'idle', progress: 0 },
      metadata: { status: 'idle', progress: 0 },
      blockchain: { status: 'idle', progress: 0 }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'estimating':
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Mint Music NFT</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isMinting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Section */}
            {isMinting && (
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Minting Progress</h3>
                <div className="space-y-2">
                  {Object.entries({
                    audio: 'Audio Upload',
                    cover: 'Cover Upload',
                    metadata: 'Metadata',
                    blockchain: 'Blockchain'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-3">
                      {getStatusIcon(progress[key as keyof MintProgress].status)}
                      <span className="text-sm text-gray-300 flex-1">{label}</span>
                      {progress[key as keyof MintProgress].status !== 'idle' && (
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress[key as keyof MintProgress].progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Audio File *
                  </label>
                  <div className="relative group">
                    <div className="w-full h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                      {audioFile ? (
                        <div className="text-center">
                          <Music className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <p className="text-sm text-white truncate">{audioFile.name}</p>
                          <p className="text-xs text-gray-400">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-300">Upload Audio</p>
                          <p className="text-xs text-gray-500">MP3, WAV, FLAC (max 50MB)</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isMinting}
                    />
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Cover Image *
                  </label>
                  <div className="relative group">
                    <div className="w-full h-32 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                      {coverImage ? (
                        <div className="text-center">
                          <img
                            src={URL.createObjectURL(coverImage)}
                            alt="Cover preview"
                            className="w-16 h-16 rounded-lg object-cover mx-auto mb-2"
                          />
                          <p className="text-sm text-white truncate">{coverImage.name}</p>
                          <p className="text-xs text-gray-400">{(coverImage.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-300">Upload Cover</p>
                          <p className="text-xs text-gray-500">JPG, PNG, GIF (max 10MB)</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isMinting}
                    />
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter track title"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                    disabled={isMinting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="Enter artist name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                    disabled={isMinting}
                  />
                </div>
              </div>

              {/* Genre and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    disabled={isMinting}
                  >
                    <option value="Electronic">Electronic</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Classical">Classical</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="R&B">R&B</option>
                    <option value="Country">Country</option>
                    <option value="Reggae">Reggae</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration
                  </label>
                  <input
                    type="text"
                    value={`${Math.floor(formData.duration / 60)}:${(formData.duration % 60).toString().padStart(2, '0')}`}
                    readOnly
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400"
                  />
                </div>
              </div>

              {/* Price and Royalty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Price (ETH)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.1"
                    step="0.001"
                    min="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                    disabled={isMinting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Royalty Percentage
                  </label>
                  <input
                    type="number"
                    value={formData.royaltyPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercentage: parseInt(e.target.value) || 0 }))}
                    placeholder="10"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                    disabled={isMinting}
                  />
                </div>
              </div>

              {/* Gas Estimation */}
              {gasEstimate && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GasPump className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Estimated Gas</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white font-medium">{gasEstimate} gas</p>
                      <p className="text-xs text-gray-400">~{estimatedCost} ETH</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isMinting}
                  className="flex-1 px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={estimateGas}
                  disabled={!formData.title || !formData.artist || !audioFile || !coverImage || isMinting}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Estimate Gas
                </button>

                <button
                  type="submit"
                  disabled={!formData.title.trim() || !formData.artist.trim() || !audioFile || !coverImage || isMinting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Disc className="w-4 h-4" />
                      Mint NFT
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
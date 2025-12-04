
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Filter,
  Music,
  ExternalLink,
  Clock,
  User,
  TrendingUp,
  RefreshCw,
  Play,
  Pause,
  Heart,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../stores/useAuthStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { contractService, NFTToken } from '../services/contracts';
import { SEO } from '../components/SEO';
import { useToastStore } from '../stores/useToastStore';

interface FilterOptions {
  genre: string;
  priceRange: 'all' | 'low' | 'medium' | 'high';
  sortBy: 'price' | 'recent' | 'popular';
}

export const NFT: React.FC = () => {
  const { user, isWeb3Connected } = useAuthStore();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = usePlayerStore();

  const [nfts, setNfts] = useState<NFTToken[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFTToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    genre: 'all',
    priceRange: 'all',
    sortBy: 'recent'
  });

  // Load marketplace NFTs
  const loadMarketplaceNFTs = async () => {
    setIsLoading(true);
    try {
      const marketplaceNfts = await contractService.getMarketplaceNFTs();
      setNfts(marketplaceNfts);
      setFilteredNfts(marketplaceNfts);
    } catch (error) {
      console.error('Failed to load marketplace NFTs:', error);
      useToastStore.getState().addToast('Failed to load NFT marketplace', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceNFTs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...nfts];

    // Genre filter
    if (filters.genre !== 'all') {
      filtered = filtered.filter(nft => nft.genre === filters.genre);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const priceRanges = {
        low: [0, 0.5],
        medium: [0.5, 1],
        high: [1, Infinity]
      };
      const [min, max] = priceRanges[filters.priceRange];
      filtered = filtered.filter(nft => {
        const price = parseFloat(nft.price);
        return price >= min && price <= max;
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'price':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'recent':
        filtered.sort((a, b) => b.mintedAt - a.mintedAt);
        break;
      case 'popular':
        // Sort by mock popularity (in real app, this would be based on views/likes)
        filtered.sort((a, b) => Math.random() - 0.5);
        break;
    }

    setFilteredNfts(filtered);
  }, [nfts, filters]);

  const handlePurchaseNFT = async (nft: NFTToken) => {
    if (!isWeb3Connected || !user?.wallet) {
      useToastStore.getState().addToast('Please connect your wallet first', 'error');
      return;
    }

    setIsPurchasing(nft.tokenId);
    try {
      const txHash = await contractService.purchaseNFT(nft.tokenId, nft.price);
      useToastStore.getState().addToast(
        `Successfully purchased "${nft.title}"! Transaction: ${txHash.slice(0, 10)}...`,
        'success'
      );

      // Reload marketplace
      await loadMarketplaceNFTs();
    } catch (error) {
      console.error('Purchase failed:', error);
      useToastStore.getState().addToast(
        `Failed to purchase NFT: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsPurchasing(null);
    }
  };

  const handlePlayPreview = (nft: NFTToken) => {
    if (!nft.audioHash) return;

    const previewTrack = {
      id: `nft_${nft.tokenId}`,
      title: nft.title,
      artist: nft.artist,
      audioUrl: `https://ipfs.io/ipfs/${nft.audioHash}`,
      coverUrl: nft.coverHash ? `https://ipfs.io/ipfs/${nft.coverHash}` : '',
      duration: nft.duration,
      genre: nft.genre
    };

    if (currentTrack?.id === previewTrack.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(previewTrack);
      }
    } else {
      playTrack(previewTrack);
    }
  };

  const genres = ['all', ...Array.from(new Set(nfts.map(nft => nft.genre)))];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'low', label: 'Under 0.5 ETH' },
    { value: 'medium', label: '0.5 - 1 ETH' },
    { value: 'high', label: 'Over 1 ETH' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recently Listed' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <>
      <SEO title="NFT Marketplace" description="Collect unique music NFTs on NORMAL DANCE" />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold text-white">NFT Marketplace</h2>
            <p className="text-gray-400">
              {filteredNfts.length > 0
                ? `${filteredNfts.length} unique music NFTs available`
                : 'Collect unique music moments'
              }
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadMarketplaceNFTs}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel p-6 rounded-2xl border border-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => setFilters(prev => ({ ...prev, genre }))}
                        className={`px-3 py-1 rounded-lg text-sm transition ${
                          filters.genre === genre
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {genre === 'all' ? 'All Genres' : genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Price Range</label>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <button
                        key={range.value}
                        onClick={() => setFilters(prev => ({ ...prev, priceRange: range.value as any }))}
                        className={`w-full px-3 py-2 rounded-lg text-sm text-left transition ${
                          filters.priceRange === range.value
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Sort By</label>
                  <div className="space-y-2">
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                        className={`w-full px-3 py-2 rounded-lg text-sm text-left transition ${
                          filters.sortBy === option.value
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="glass-panel p-3 rounded-2xl animate-pulse">
                <div className="aspect-square rounded-xl bg-white/10 mb-3"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredNfts.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {nfts.length === 0 ? 'No NFTs Available' : 'No NFTs Match Your Filters'}
            </h3>
            <p className="text-gray-400 mb-6">
              {nfts.length === 0
                ? 'Be the first to mint a music NFT on Normal Dance!'
                : 'Try adjusting your filters to see more results'
              }
            </p>
            {filters.genre !== 'all' || filters.priceRange !== 'all' && (
              <button
                onClick={() => setFilters({ genre: 'all', priceRange: 'all', sortBy: 'recent' })}
                className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredNfts.map((nft, index) => {
              const isCurrentlyPlaying = currentTrack?.id === `nft_${nft.tokenId}`;
              const isOwnNFT = user?.wallet?.toLowerCase() === nft.owner.toLowerCase();

              return (
                <motion.div
                  key={nft.tokenId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel p-4 rounded-2xl hover:-translate-y-1 transition-all duration-300 group relative"
                >
                  {/* NFT Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-violet-500/30">
                      <span className="text-xs font-bold text-violet-300">#{nft.tokenId}</span>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                    {nft.coverHash ? (
                      <img
                        src={`https://ipfs.io/ipfs/${nft.coverHash}`}
                        alt={nft.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Music className="w-12 h-12 text-purple-400" />
                      </div>
                    )}

                    {/* Audio Preview Button */}
                    {nft.audioHash && (
                      <button
                        onClick={() => handlePlayPreview(nft)}
                        className="absolute bottom-2 left-2 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition"
                      >
                        {isCurrentlyPlaying && isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* NFT Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-white font-bold text-lg truncate">{nft.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{nft.artist}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{nft.genre}</span>
                        <span>•</span>
                        <span>{Math.floor(nft.duration / 60)}:{(nft.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">Price</p>
                        <p className="text-white font-bold text-lg">{nft.price} ETH</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* View on Etherscan */}
                        <a
                          href={`https://etherscan.io/nft/${nft.tokenId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                          title="View on Etherscan"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>

                        {/* Purchase Button */}
                        {!isOwnNFT ? (
                          <button
                            onClick={() => handlePurchaseNFT(nft)}
                            disabled={isPurchasing === nft.tokenId || !isWeb3Connected}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
                          >
                            {isPurchasing === nft.tokenId ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <ShoppingBag className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-xs font-medium">
                            Owned
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(nft.mintedAt * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{nft.royaltyPercentage}% royalty</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Not Connected CTA */}
        {!isWeb3Connected && filteredNfts.length > 0 && (
          <div className="glass-panel p-8 rounded-2xl text-center border border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">Connect Your Wallet to Purchase NFTs</h3>
            <p className="text-gray-400 mb-6">
              Connect your Web3 wallet to start collecting unique music NFTs from talented artists.
            </p>
            <button
              onClick={() => window.location.href = '/wallet'}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </>
  );
};

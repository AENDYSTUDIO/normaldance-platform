import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Clock, TrendingUp, Music, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchFilters } from '../types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  isExpanded: controlledExpanded,
  onToggle
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const genres = [
    { id: 'electronic', name: 'Electronic', color: 'from-blue-500 to-purple-500' },
    { id: 'hip-hop', name: 'Hip Hop', color: 'from-orange-500 to-red-500' },
    { id: 'rock', name: 'Rock', color: 'from-red-500 to-pink-500' },
    { id: 'pop', name: 'Pop', color: 'from-pink-500 to-purple-500' },
    { id: 'jazz', name: 'Jazz', color: 'from-blue-500 to-teal-500' },
    { id: 'classical', name: 'Classical', color: 'from-purple-500 to-indigo-500' },
    { id: 'rnb', name: 'R&B', color: 'from-purple-500 to-pink-500' },
    { id: 'country', name: 'Country', color: 'from-green-500 to-teal-500' },
    { id: 'metal', name: 'Metal', color: 'from-gray-600 to-gray-800' },
    { id: 'reggae', name: 'Reggae', color: 'from-green-500 to-yellow-500' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: Filter },
    { value: 'plays', label: 'Most Played', icon: TrendingUp },
    { value: 'likes', label: 'Most Liked', icon: Music },
    { value: 'created_at', label: 'Recently Added', icon: Clock }
  ];

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const durationRanges = [
    { value: [0, 60], label: 'Under 1 min' },
    { value: [60, 120], label: '1-2 min' },
    { value: [120, 180], label: '2-3 min' },
    { value: [180, 300], label: '3-5 min' },
    { value: [300, 600], label: '5-10 min' },
    { value: [600, Infinity], label: 'Over 10 min' }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setExpandedSections([]);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.genres?.length) count++;
    if (filters.artist) count++;
    if (filters.duration_min || filters.duration_max) count++;
    if (filters.date_range) count++;
    if (filters.sort_by && filters.sort_by !== 'relevance') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <motion.div
      layout
      className="glass-panel border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div
        onClick={onToggle || (() => setInternalExpanded(!isExpanded))}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-medium">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Clear
            </button>
          )}

          {onToggle !== undefined && (
            isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Filters Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6 border-t border-white/10">

              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Query</label>
                <input
                  type="text"
                  placeholder="Enter keywords..."
                  value={filters.query || ''}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Artist */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
                <input
                  type="text"
                  placeholder="Artist name..."
                  value={filters.artist || ''}
                  onChange={(e) => updateFilter('artist', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Genres */}
              <div>
                <button
                  onClick={() => toggleSection('genres')}
                  className="flex items-center justify-between w-full mb-3 text-left"
                >
                  <label className="text-sm font-medium text-gray-300">Genres</label>
                  {expandedSections.includes('genres') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {expandedSections.includes('genres') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-2 md:grid-cols-5 gap-2 overflow-hidden"
                    >
                      {genres.map((genre) => {
                        const isSelected = filters.genres?.includes(genre.name);
                        return (
                          <button
                            key={genre.id}
                            onClick={() => {
                              const currentGenres = filters.genres || [];
                              const newGenres = isSelected
                                ? currentGenres.filter(g => g !== genre.name)
                                : [...currentGenres, genre.name];
                              updateFilter('genres', newGenres);
                            }}
                            className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all overflow-hidden group ${
                              isSelected
                                ? 'text-white'
                                : 'text-gray-400 hover:text-white bg-white/5'
                            }`}
                          >
                            {isSelected && (
                              <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} opacity-20`} />
                            )}
                            <span className="relative z-10">{genre.name}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Duration */}
              <div>
                <button
                  onClick={() => toggleSection('duration')}
                  className="flex items-center justify-between w-full mb-3 text-left"
                >
                  <label className="text-sm font-medium text-gray-300">Duration</label>
                  {expandedSections.includes('duration') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {expandedSections.includes('duration') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {durationRanges.map((range) => {
                          const isSelected =
                            (filters.duration_min === range.value[0] && filters.duration_max === range.value[1]) ||
                            (range.value[1] === Infinity && filters.duration_min === range.value[0] && !filters.duration_max);

                          return (
                            <button
                              key={range.label}
                              onClick={() => {
                                updateFilter('duration_min', range.value[0]);
                                updateFilter('duration_max', range.value[1] === Infinity ? undefined : range.value[1]);
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {range.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-4 mt-4">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Min (seconds)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={filters.duration_min || ''}
                            onChange={(e) => updateFilter('duration_min', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Max (seconds)</label>
                          <input
                            type="number"
                            placeholder="∞"
                            value={filters.duration_max || ''}
                            onChange={(e) => updateFilter('duration_max', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = filters.sort_by === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => updateFilter('sort_by', option.value as SearchFilters['sort_by'])}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateFilter('sort_order', 'desc')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      filters.sort_order === 'desc'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Descending
                  </button>
                  <button
                    onClick={() => updateFilter('sort_order', 'asc')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      filters.sort_order === 'asc'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Ascending
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
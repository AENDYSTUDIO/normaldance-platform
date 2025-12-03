
import React, { useMemo, useState } from 'react';
import { Clock, PlayCircle } from 'lucide-react';

import { Track } from '../types';
import { useTracksStore } from '../stores/useTracksStore';
import { TableRowSkeleton } from '../components/Skeleton';

interface LibraryProps {
  onPlay?: (track: Track) => void;
  tracks?: Track[];
}

export const Library: React.FC<LibraryProps> = ({ onPlay, tracks }) => {
  const [activeTab, setActiveTab] = useState('liked');
  const store = useTracksStore();
  const list = useMemo(() => tracks ?? store.tracks, [tracks, store.tracks]);
  const isLoading = store.isLoading && !tracks;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-display font-bold text-white">Your Library</h2>
      
      <div className="flex space-x-6 border-b border-white/10 pb-4">
         {['liked', 'playlists', 'history'].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`text-sm font-medium capitalize ${activeTab === tab ? 'text-violet-400 border-b-2 border-violet-400 pb-4 -mb-4.5' : 'text-gray-400 hover:text-white transition'}`}
           >
             {tab} Songs
           </button>
         ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Artist</th>
              <th className="px-6 py-4">Date Added</th>
              <th className="px-6 py-4 text-right"><Clock size={16} className="ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
              : list.map((track, i) => (
                <tr key={track.id} className="border-b border-white/5 hover:bg-white/5 transition group">
                  <td className="px-6 py-4 text-gray-500 group-hover:text-white w-16">
                    <span className="group-hover:hidden">{i + 1}</span>
                    <button 
                      onClick={() => onPlay && onPlay(track)}
                      className="hidden group-hover:block text-violet-400 hover:scale-110 transition"
                    >
                      <PlayCircle size={20} />
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <img src={track.coverUrl} loading="lazy" className="w-10 h-10 rounded" alt="" />
                      {track.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{track.artist}</td>
                  <td className="px-6 py-4 text-gray-500">
                      {track.dateAdded ? new Date(track.dateAdded).toLocaleDateString() : '2 days ago'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-right">{track.duration}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

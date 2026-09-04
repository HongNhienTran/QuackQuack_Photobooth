'use client';

import React, { useState } from 'react';
import { Disc3, Music, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '@/utils/audio';

interface VinylPlayerProps {
  currentTrack?: string;
  artist?: string;
}

export const VinylPlayer: React.FC<VinylPlayerProps> = ({
  currentTrack = 'Quack! Beat',
  artist = '8-Bit Arcade',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    sounds.playPop();
    const active = sounds.toggleBgm((playing) => {
      setIsPlaying(playing);
    });
    setIsPlaying(active);
  };

  return (
    <div
      onClick={handleToggle}
      className="cursor-pointer group flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/80 hover:bg-white border border-[#bde1fa] shadow-sm hover:shadow-md transition-all duration-300"
      title="Bấm để Bật/Tắt nhạc nền 8-bit lofi"
    >
      {/* Spinning Vinyl Disc */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
        <div
          className={`w-10 h-10 rounded-full bg-[#1b232c] border-2 border-[#374555] flex items-center justify-center shadow-md transition-transform ${
            isPlaying ? 'vinyl-spinning' : 'group-hover:rotate-12'
          }`}
        >
          {/* Vinyl Grooves */}
          <div className="w-7 h-7 rounded-full border border-gray-600/40 flex items-center justify-center">
            {/* Center Label */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#7ec3f3] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Music note badge */}
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        )}
      </div>

      {/* Track Info */}
      <div className="flex flex-col text-left overflow-hidden select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-[#2e5072] tracking-wide truncate">
            {currentTrack}
          </span>
          {isPlaying ? (
            <Volume2 className="w-3 h-3 text-pink-500 animate-pulse flex-shrink-0" />
          ) : (
            <VolumeX className="w-3 h-3 text-gray-400 flex-shrink-0" />
          )}
        </div>
        <span className="text-[10px] font-medium text-[#7a9bb8] truncate">
          {isPlaying ? 'Đang phát • Chạm để tắt' : `${artist} • Chạm để nghe`}
        </span>
      </div>
    </div>
  );
};

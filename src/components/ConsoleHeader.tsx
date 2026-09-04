'use client';

import React from 'react';
import { Heart, Sparkles, Volume2, VolumeX, Camera, Target, Trophy } from 'lucide-react';
import { sounds } from '@/utils/audio';

interface ConsoleHeaderProps {
  currentRoom: 'photobooth' | 'duckhunt' | 'trophy';
  setRoom: (room: 'photobooth' | 'duckhunt' | 'trophy') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const ConsoleHeader: React.FC<ConsoleHeaderProps> = ({
  currentRoom,
  setRoom,
  soundEnabled,
  setSoundEnabled,
}) => {
  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      sounds.playPop();
    }
  };

  const navItems = [
    { id: 'photobooth', label: '📸 Photobooth', icon: Camera },
    { id: 'duckhunt', label: '🦆 Bắn Vịt Retro', icon: Target },
    { id: 'trophy', label: '🏆 Thành Tích', icon: Trophy },
  ] as const;

  return (
    <header className="relative w-full max-w-6xl mx-auto pt-2 px-3 sm:px-6">
      {/* Top Console Bar */}
      <div className="relative flex items-center justify-between bg-gradient-to-r from-[#cae4fa] via-[#e2f1fc] to-[#cae4fa] rounded-t-3xl border-t-2 border-x-2 border-white px-3 sm:px-6 py-2 shadow-sm">
        
        {/* Left Section: Heart badge & Speaker vent */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-pink-200 flex items-center justify-center shadow-inner group cursor-pointer hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4766] fill-[#ff4766] animate-pulse" />
          </div>
          {/* Side Speaker vent slits */}
          <div className="hidden sm:flex flex-col gap-1 w-6 py-1">
            <div className="h-1 bg-[#97c4e9] rounded-full" />
            <div className="h-1 bg-[#97c4e9] rounded-full" />
            <div className="h-1 bg-[#97c4e9] rounded-full" />
          </div>
        </div>

        {/* Center Notch Tab with Bubble Logo */}
        <div className="relative -top-3 z-10 px-6 sm:px-10 py-1.5 sm:py-2 bg-gradient-to-b from-white to-[#e4f3fd] rounded-b-2xl border-b-2 border-x-2 border-[#a3d0f4] shadow-md flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4295db] animate-bounce" />
          <span className="text-sm sm:text-lg font-black tracking-wider text-[#266299] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] font-sans uppercase">
            Quack! Hub
          </span>
          <span className="text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-full bg-[#7ec3f3] text-white tracking-widest">
            Y2K
          </span>
        </div>

        {/* Right Section: Sound Toggle & Heart badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border ${
              soundEnabled
                ? 'bg-white/90 text-[#285d88] border-[#a0cdef] shadow-sm'
                : 'bg-gray-100/80 text-gray-400 border-gray-200'
            }`}
            title="Bật/Tắt âm thanh hiệu ứng"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#3b8fd4]" />
                <span className="hidden md:inline">SFX BẬT</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden md:inline">SFX TẮT</span>
              </>
            )}
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-pink-200 flex items-center justify-center shadow-inner group cursor-pointer hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4766] fill-[#ff4766] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="bg-white/95 border-x-2 border-b-2 border-white shadow-sm px-2 sm:px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 mx-auto">
          {navItems.map((item) => {
            const isActive = currentRoom === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playPop();
                  setRoom(item.id);
                }}
                className={`y2k-pill-btn px-3 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#5daeec] to-[#3a93d8] text-white shadow-[0_3px_10px_rgba(58,147,216,0.35)] scale-105'
                    : 'bg-[#edf6fd] text-[#345f85] hover:bg-[#dbeefa] border border-[#c1e2fa]'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

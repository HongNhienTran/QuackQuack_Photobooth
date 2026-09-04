'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Camera } from 'lucide-react';
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
  const [scrollRatio, setScrollRatio] = useState<number>(0);

  // Monitor scroll progression to animate the expanding single-layer background
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      // Interpolate from 0 to 1 over the first 140px of scroll
      const progress = Math.min(Math.max(y / 140, 0), 1);
      setScrollRatio(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      sounds.playPop();
    }
  };

  const navItems: { id: 'photobooth' | 'duckhunt' | 'trophy'; label: string; icon?: typeof Camera }[] = [
    { id: 'photobooth', label: 'Photobooth', icon: Camera },
    { id: 'duckhunt', label: 'Duck Hunt' },
    { id: 'trophy', label: 'Thành Tích' },
  ];

  const isScrolled = scrollRatio > 0.05;

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 pointer-events-none">
      {/* 
        Single Unified Frosted Glass Nav:
        - At scroll = 0: Compact floating bar wrapping only the nav items (width: ~1040px, rounded-xl)
        - As you scroll down: Expands smoothly outward to 100% full width, seamlessly pinned at the top
        - ZERO double-layers or nested colored boxes!
      */}
      <div
        className="pointer-events-auto mx-auto flex items-center justify-between transition-all duration-300 ease-out"
        style={{
          width: scrollRatio > 0.8 ? '100%' : `${92 + scrollRatio * 8}%`,
          maxWidth: scrollRatio > 0.8 ? '100%' : `${1040 + scrollRatio * 800}px`,
          marginTop: scrollRatio > 0.8 ? '0px' : `${Math.max(12 - scrollRatio * 12, 0)}px`,
          paddingLeft: scrollRatio > 0.8 ? '1.5rem' : '1.25rem',
          paddingRight: scrollRatio > 0.8 ? '1.5rem' : '1.25rem',
          paddingTop: scrollRatio > 0.8 ? '0.65rem' : '0.6rem',
          paddingBottom: scrollRatio > 0.8 ? '0.65rem' : '0.6rem',
          borderRadius: scrollRatio > 0.8 ? '0px' : `${Math.max(14 - scrollRatio * 14, 0)}px`,
          backgroundColor: `rgba(255, 255, 255, ${0.46 + scrollRatio * 0.32})`,
          backdropFilter: `blur(${18 + scrollRatio * 18}px)`,
          WebkitBackdropFilter: `blur(${18 + scrollRatio * 18}px)`,
          borderTop: scrollRatio > 0.8 ? 'none' : '1px solid rgba(255, 255, 255, 0.85)',
          borderLeft: scrollRatio > 0.8 ? 'none' : '1px solid rgba(255, 255, 255, 0.85)',
          borderRight: scrollRatio > 0.8 ? 'none' : '1px solid rgba(255, 255, 255, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: isScrolled
            ? '0 6px 24px rgba(90, 80, 140, 0.08)'
            : '0 4px 16px rgba(90, 80, 140, 0.04)',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => {
            sounds.playPop();
            setRoom('photobooth');
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Mascot.png"
            alt="QuackQuack Studio Logo"
            className="w-8 h-8 rounded-lg object-contain shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="text-base font-extrabold tracking-tight text-[#14151c] font-sans">
            QuackQuack<span className="text-[#8b5cf6]"> </span>Studio
          </span>
        </div>

        {/* Center Navigation Tabs - Direct buttons on single frosted surface (No extra nested box!) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = currentRoom === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playPop();
                  setRoom(item.id);
                  const target = document.getElementById('studio-deck');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#121218] text-white shadow-xs'
                    : 'text-[#474f63] hover:text-[#121218] hover:bg-white/60'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Sound FX Toggle & Action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-[#3e4554] hover:text-[#121218] hover:bg-white/60 transition-all border border-transparent hover:border-white/70"
            title="Bật/Tắt âm thanh hiệu ứng"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <span className="hidden sm:inline">Âm thanh</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Tắt âm</span>
              </>
            )}
          </button>

          {/* Action Button */}
          <button
            onClick={() => {
              sounds.playPop();
              setRoom(currentRoom === 'duckhunt' ? 'photobooth' : 'duckhunt');
            }}
            className="dark-pill-btn px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <span>{currentRoom === 'duckhunt' ? 'Mở Studio +' : 'Chơi Game +'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, FolderPlus, SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { sounds } from '@/utils/audio';

export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
}

const DEFAULT_PLAYLIST: Track[] = [
  {
    id: 'track-1',
    title: 'Our Vintage Look',
    artist: 'Obito',
    src: `/music/${encodeURIComponent('OUR VINTAGE LOOK - Obito - (Official Lyric Video).mp3')}`,
  },
  {
    id: 'track-2',
    title: 'Soju Love',
    artist: 'Obito',
    src: `/music/${encodeURIComponent('SOJU LOVE - Obito - Official Music Video.mp3')}`,
  },
];

export const VinylPlayer: React.FC = () => {
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentSong = playlist[currentIndex] || playlist[0];

  // Play a specific track
  const playTrack = useCallback((index: number, autoStart = true) => {
    if (!audioRef.current || playlist.length === 0) return;
    const target = playlist[index];
    if (!target) return;

    audioRef.current.src = target.src;
    audioRef.current.currentTime = 0;

    if (autoStart) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Lỗi phát nhạc:', err);
          setIsPlaying(false);
        });
    }
  }, [playlist]);

  // Next track
  const playNext = useCallback(() => {
    sounds.playPop();
    const nextIdx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIdx);
    playTrack(nextIdx, isPlaying);
  }, [currentIndex, playlist.length, isPlaying, playTrack]);

  // Previous track
  const playPrev = useCallback(() => {
    sounds.playPop();
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIdx);
    playTrack(prevIdx, isPlaying);
  }, [currentIndex, playlist.length, isPlaying, playTrack]);

  // Initialize Audio & Automatic Playback on Load
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.6;
    audioRef.current = audio;

    // Auto next song on end
    audio.onended = () => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % playlist.length;
        if (audioRef.current && playlist[next]) {
          audioRef.current.src = playlist[next].src;
          audioRef.current.play().catch(() => {});
        }
        return next;
      });
    };

    // Preload first song
    if (playlist[0]) {
      audio.src = playlist[0].src;
    }

    const cleanupListeners = () => {
      window.removeEventListener('click', triggerStart);
      window.removeEventListener('keydown', triggerStart);
      window.removeEventListener('touchstart', triggerStart);
      window.removeEventListener('scroll', triggerStart);
      window.removeEventListener('mousemove', triggerStart);
    };

    const triggerStart = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            cleanupListeners();
          })
          .catch(() => {});
      }
    };

    // 1. Direct autoplay attempt as soon as the page opens
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        // 2. If browser autoplay policy blocks unmuted audio before user gesture,
        // start playback immediately on the very first touch, click, scroll or mouse movement
        window.addEventListener('click', triggerStart, { once: true });
        window.addEventListener('keydown', triggerStart, { once: true });
        window.addEventListener('touchstart', triggerStart, { once: true });
        window.addEventListener('scroll', triggerStart, { once: true });
        window.addEventListener('mousemove', triggerStart, { once: true });
      });

    return () => {
      cleanupListeners();
      audio.pause();
      audio.src = '';
    };
  }, [playlist]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    sounds.playPop();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Không thể phát bài hát:', err);
        });
    }
  };

  // Add custom audio file from user device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playPop();
    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name.replace(/\.[^/.]+$/, '');

    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title: fileName,
      artist: 'File của bạn 🎵',
      src: fileUrl,
    };

    setPlaylist((prev) => [...prev, newTrack]);
    const newIdx = playlist.length;
    setCurrentIndex(newIdx);

    if (audioRef.current) {
      audioRef.current.src = fileUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    e.target.value = '';
  };

  return (
    <div className="relative group flex flex-col gap-2.5 p-3 rounded-xl glass-card transition-all duration-200">
      {/* Top Bar: Turntable Deck (Vinyl + Tonearm) & Track Info */}
      <div className="flex items-center justify-between gap-3">
        
        {/* Turntable Assembly with Realistic Tonearm */}
        <div
          onClick={handleTogglePlay}
          className="relative w-16 h-14 flex-shrink-0 flex items-center cursor-pointer select-none"
          title={isPlaying ? 'Bấm để Tạm dừng' : 'Bấm để Phát nhạc'}
        >
          {/* Turntable Platter Base */}
          <div className="vinyl-disc relative w-12 h-12 rounded-full bg-[#1e232d] border border-neutral-700 shadow-md flex items-center justify-center">
            {/* Spinning Vinyl Record */}
            <div
              className={`w-11 h-11 rounded-full bg-[#111216] border border-neutral-600/60 flex items-center justify-center transition-transform ${
                isPlaying ? 'vinyl-spinning' : 'group-hover:rotate-6'
              }`}
            >
              {/* Concentric Grooves */}
              <div className="w-8 h-8 rounded-full border border-neutral-700/60 flex items-center justify-center">
                {/* Center Label */}
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Realistic Metallic Tonearm (Thanh quay / Cần kim đĩa than) */}
          <div
            className="absolute top-0 right-0 w-8 h-12 pointer-events-none transition-transform duration-700 ease-out z-10 origin-[22px_4px]"
            style={{
              transform: isPlaying ? 'rotate(24deg)' : 'rotate(-10deg)',
            }}
          >
            <svg viewBox="0 0 32 48" className="w-full h-full drop-shadow-sm">
              {/* Tonearm Pivot Base */}
              <circle cx="22" cy="4" r="3.5" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
              <circle cx="22" cy="4" r="1.8" fill="#d1d5db" />
              {/* Arm Shaft (Metallic Chrome) */}
              <path d="M 22 4 L 14 26 L 10 36" fill="none" stroke="#e5e7eb" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 21.5 4.5 L 13.5 26.5 L 9.5 36.5" fill="none" stroke="#9ca3af" strokeWidth="0.8" strokeLinecap="round" />
              {/* Cartridge / Stylus Head */}
              <rect x="6" y="35" width="6" height="8" rx="1" transform="rotate(16 9 39)" fill="#18181b" stroke="#8b5cf6" strokeWidth="0.8" />
              {/* Needle Tip */}
              <circle cx="7" cy="42" r="0.8" fill="#ec4899" />
            </svg>
          </div>
        </div>

        {/* Track Title, Artist & Live Status */}
        <div className="flex flex-col text-left overflow-hidden flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#181b24] tracking-tight truncate">
              {currentSong?.title}
            </span>
            {isPlaying ? (
              <Volume2 className="w-3.5 h-3.5 text-[#8b5cf6] animate-pulse flex-shrink-0" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            )}
          </div>
          <span className="text-[10px] font-semibold text-[#666f85] truncate">
            {currentSong?.artist} • {isPlaying ? 'Đang phát' : 'Đã tạm dừng'}
          </span>
        </div>

        {/* Track Counter Badge */}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/70 text-[#6444b5] border border-white/80 flex-shrink-0">
          {currentIndex + 1}/{playlist.length}
        </span>
      </div>

      {/* Bottom Bar: Player Controls with Dedicated Play & Pause Button */}
      <div className="flex items-center justify-between pt-2 border-t border-white/60">
        
        {/* Navigation & Play/Pause Button Group */}
        <div className="flex items-center gap-1.5">
          {/* Prev Track */}
          <button
            onClick={playPrev}
            className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#2a2f3d] transition-all hover:scale-105 border border-white/80 shadow-xs"
            title="Bài trước"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Dedicated Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs ${
              isPlaying
                ? 'bg-[#121218] text-white hover:bg-[#22222d]'
                : 'bg-[#8b5cf6] text-white hover:bg-[#7c4ae8]'
            }`}
            title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Dừng</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current ml-0.5" />
                <span>Phát</span>
              </>
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={playNext}
            className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#2a2f3d] transition-all hover:scale-105 border border-white/80 shadow-xs"
            title="Bài tiếp theo"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add Custom Track Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white text-[#2a2f3d] text-[10px] font-bold transition-all border border-white/80 hover:scale-105 shadow-xs"
          title="Thêm file MP3 khác vào danh sách phát"
        >
          <FolderPlus className="w-3 h-3 text-[#8b5cf6]" />
          <span>Thêm bài</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

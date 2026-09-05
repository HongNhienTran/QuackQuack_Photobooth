'use client';

import React from 'react';
import { Camera, Target, Trophy, Sparkles, Music2, Award, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { VinylPlayer } from './VinylPlayer';
import { sounds } from '@/utils/audio';

interface SidebarProps {
  currentRoom: 'photobooth' | 'duckhunt' | 'trophy';
  setRoom: (room: 'photobooth' | 'duckhunt' | 'trophy') => void;
  highScore: number;
  snapsCount: number;
  onResetData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoom,
  setRoom,
  highScore,
  snapsCount,
  onResetData,
}) => {
  const rooms = [
    {
      id: 'photobooth',
      title: 'Phòng Photobooth',
      sub: 'Chụp ảnh & Khung nghệ thuật',
      icon: Camera,
    },
    {
      id: 'duckhunt',
      title: 'Phòng Bắn Vịt',
      sub: 'Arcade Mini Game',
      icon: Target,
    },
    {
      id: 'trophy',
      title: 'Bảng Thành Tích',
      sub: 'Kỷ lục & Danh hiệu',
      icon: Trophy,
    },
  ] as const;

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
      {/* Floating Glassmorphic Deck Panel */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <span className="font-extrabold text-xs text-[#52596c] tracking-wider uppercase">
            Không Gian Trải Nghiệm
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/70 text-[#6d4bc4] border border-white/80">
            Studio Space
          </span>
        </div>

        {/* Room Navigation Buttons */}
        <nav className="flex flex-col gap-2">
          {rooms.map((room) => {
            const isActive = currentRoom === room.id;
            const Icon = room.icon;
            return (
              <button
                key={room.id}
                onClick={() => {
                  sounds.playPop();
                  setRoom(room.id);
                }}
                className={`group w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 border ${
                  isActive
                    ? 'bg-white text-[#121218] border-white shadow-xs'
                    : 'bg-white/40 hover:bg-white/70 text-[#474f63] border-white/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform ${
                    isActive
                      ? 'bg-[#121218] text-white shadow-xs'
                      : 'bg-white/70 text-[#64528c] border border-white/80 group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs font-bold block truncate ${
                      isActive ? 'text-[#121218]' : 'text-[#2e3444]'
                    }`}
                  >
                    {room.title}
                  </span>
                  <p
                    className={`text-[11px] truncate ${
                      isActive ? 'text-[#6c7487]' : 'text-[#7d869b]'
                    }`}
                  >
                    {room.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Vinyl Player Widget (Obito Playlist) */}
        <div className="pt-2 border-t border-white/50">
          <span className="text-[10px] font-bold text-[#6a7288] uppercase tracking-wider block mb-2 px-1">
            Âm Nhạc Studio
          </span>
          <VinylPlayer />
        </div>

        {/* Minimalist Quote / Philosophy Card */}
        <div className="p-3.5 rounded-xl bg-white/50 border border-white/70 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#4c5468]">
            <span className="flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-[#8b5cf6]" />
              Playlist Obito
            </span>
            <span className="text-[10px] text-[#7150c2] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 font-semibold">
              Playing
            </span>
          </div>
          <p className="text-xs text-[#404656] font-medium italic leading-relaxed">
            &ldquo;Our vintage look, ghi lại từng khoảnh khắc đáng nhớ trong không gian mở.&rdquo;
          </p>
        </div>

        {/* Minimal Stats Cards */}
        <div className="grid grid-cols-2 gap-2.5 text-center pt-1 border-t border-white/50">
          <div className="p-3 rounded-xl bg-white/50 border border-white/70">
            <span className="block text-[10px] font-bold text-[#757d92] uppercase">
              Điểm Kỷ Lục
            </span>
            <span className="text-base font-black text-[#121218]">
              {highScore.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/50 border border-white/70">
            <span className="block text-[10px] font-bold text-[#757d92] uppercase">
              Ảnh Đã Tạo
            </span>
            <span className="text-base font-black text-[#8b5cf6]">
              {snapsCount}
            </span>
          </div>
        </div>

        {/* Reset / Refresh LocalStorage Data */}
        {onResetData && (
          <button
            onClick={onResetData}
            className="w-full py-2 px-3 text-xs font-semibold text-[#52596d] hover:text-red-600 bg-white/40 hover:bg-white/70 transition-all border border-white/70 flex items-center justify-center gap-1.5 shadow-xs"
            title="Làm mới và xóa bộ nhớ LocalStorage"
          >
            <RotateCcw className="w-3.5 h-3.5 text-current" />
            <span>Làm mới bộ nhớ (Reset)</span>
          </button>
        )}
      </div>
    </aside>
  );
};

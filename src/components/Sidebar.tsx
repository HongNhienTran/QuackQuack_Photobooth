'use client';

import React from 'react';
import { Camera, Target, Trophy, Sparkles, MessageCircleHeart, Info } from 'lucide-react';
import { VinylPlayer } from './VinylPlayer';
import { sounds } from '@/utils/audio';

interface SidebarProps {
  currentRoom: 'photobooth' | 'duckhunt' | 'trophy';
  setRoom: (room: 'photobooth' | 'duckhunt' | 'trophy') => void;
  highScore: number;
  snapsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoom,
  setRoom,
  highScore,
  snapsCount,
}) => {
  const rooms = [
    {
      id: 'photobooth',
      title: 'Phòng Photobooth',
      sub: 'Chụp ảnh & Khung hình',
      icon: Camera,
      tag: 'HOT',
      color: 'from-pink-400 to-rose-500',
    },
    {
      id: 'duckhunt',
      title: 'Phòng Bắn Vịt',
      sub: 'Java Arcade Cổ Điển',
      icon: Target,
      tag: 'GAME',
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'trophy',
      title: 'Phòng Chiến Tích',
      sub: 'Bảng vàng & Kỷ niệm',
      icon: Trophy,
      tag: 'VIP',
      color: 'from-sky-400 to-blue-500',
    },
  ] as const;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
      {/* Desktop Sidebar Panel */}
      <div className="y2k-panel rounded-3xl p-4 flex flex-col gap-4 shadow-md">
        {/* Console Brand badge */}
        <div className="flex items-center justify-between px-2 pb-2 border-b border-[#cde5f8]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6cbbf5] to-[#4295db] flex items-center justify-center text-white font-black text-xs shadow-sm">
              Q!
            </div>
            <span className="font-extrabold text-sm text-[#27537b] tracking-wider uppercase">
              Chế Độ Chơi
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcf0fe] text-[#2c6aa0] border border-[#b8ddfa]">
            V2.0 Y2K
          </span>
        </div>

        {/* Room Navigation Buttons */}
        <nav className="flex flex-col gap-2.5">
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
                className={`y2k-pill-btn group w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#5caeeb] to-[#3a92d7] text-white border-transparent shadow-[0_4px_12px_rgba(58,146,215,0.35)] scale-[1.02]'
                    : 'bg-white/90 hover:bg-white text-[#2b4c6c] border-[#bfe1fb] hover:border-[#9eccee]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e7f4fe] text-[#3484c4] border border-[#c4e4fb]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black truncate ${
                        isActive ? 'text-white' : 'text-[#264b6e]'
                      }`}
                    >
                      {room.title}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-[#edf6fd] text-[#3379b3] border border-[#cae5fa]'
                      }`}
                    >
                      {room.tag}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate ${
                      isActive ? 'text-white/80' : 'text-[#6f8fae]'
                    }`}
                  >
                    {room.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Vinyl Player Widget (Inspired by user's reference image) */}
        <div className="pt-2 border-t border-[#cde5f8]">
          <span className="text-[10px] font-bold text-[#6f90af] uppercase tracking-wider block mb-2 px-1">
            🎧 Retro Soundbox
          </span>
          <VinylPlayer currentTrack="Rude! Quack" artist="Hearts2Hearts" />
        </div>

        {/* Cute Speech Bubble / Status (Inspired by Carmen chat box in reference) */}
        <div className="relative p-3 rounded-2xl bg-white/90 border border-[#bfe1fb] shadow-sm flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#356189]">
            <span className="flex items-center gap-1">
              <MessageCircleHeart className="w-3.5 h-3.5 text-pink-500" />
              Duck-chan nhắn gửi:
            </span>
            <span className="text-[10px] text-pink-500 font-semibold">Online 🟢</span>
          </div>
          <p className="text-xs text-[#416180] font-medium leading-relaxed bg-[#f2f8fe] p-2 rounded-xl border border-[#d6ecfd]">
            {currentRoom === 'photobooth' && '✨ "Chụp ảnh xong nhớ dán thêm sticker vịt ngố vào khung hình nha!"'}
            {currentRoom === 'duckhunt' && '🎯 "Nạp đạn bằng phím Space/R hoặc chạm nút Nạp khi hết 6 viên nhé!"'}
            {currentRoom === 'trophy' && '🏆 "Bắn càng nhiều vịt, danh hiệu Thợ Săn Thiện Xạ càng lung linh!"'}
          </p>
        </div>

        {/* Mini Stats Footer */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-xl bg-[#eef7fe] border border-[#c4e3fb]">
            <span className="block text-[10px] font-bold text-[#6487a8] uppercase">
              Kỷ Lục Điểm
            </span>
            <span className="text-sm font-black text-[#ff4766]">
              {highScore.toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#eef7fe] border border-[#c4e3fb]">
            <span className="block text-[10px] font-bold text-[#6487a8] uppercase">
              Ảnh Đã Chụp
            </span>
            <span className="text-sm font-black text-[#2e7ec4]">
              {snapsCount}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

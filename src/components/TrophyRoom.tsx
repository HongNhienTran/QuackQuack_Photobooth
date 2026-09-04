'use client';

import React from 'react';
import { Trophy, Award, Sparkles, Star, Camera, Target, Heart } from 'lucide-react';
import { sounds } from '@/utils/audio';

interface TrophyRoomProps {
  highScore: number;
  snapsCount: number;
  onGoToPhotoboothWithTrophy: (title: string, score: number) => void;
}

export const TrophyRoom: React.FC<TrophyRoomProps> = ({
  highScore,
  snapsCount,
  onGoToPhotoboothWithTrophy,
}) => {
  const badges = [
    {
      id: 1,
      title: 'Tân Binh Thiện Xạ',
      desc: 'Đạt ít nhất 200 điểm khi bắn vịt',
      unlocked: highScore >= 200,
      icon: '🦆',
      reward: 'Danh hiệu thợ săn nhập môn',
    },
    {
      id: 2,
      title: 'Bách Phát Bách Trúng',
      desc: 'Đạt trên 800 điểm trong phòng săn vịt',
      unlocked: highScore >= 800,
      icon: '🎯',
      reward: 'Huy hiệu vàng thiện xạ',
    },
    {
      id: 3,
      title: 'Huyền Thoại Săn Vịt',
      desc: 'Đạt đỉnh cao 1500+ điểm',
      unlocked: highScore >= 1500,
      icon: '👑',
      reward: 'Vương miện Vịt Chúa Hoàng Gia',
    },
    {
      id: 4,
      title: 'Chiến Thần Photobooth',
      desc: 'Chụp và tải về ít nhất 1 bức ảnh',
      unlocked: snapsCount >= 1,
      icon: '📸',
      reward: 'Sticker K-Pop Idol Pass',
    },
    {
      id: 5,
      title: 'Nhiếp Ảnh Gia Đam Mê',
      desc: 'Tạo từ 3 bức ảnh photobooth trở lên',
      unlocked: snapsCount >= 3,
      icon: '⭐',
      reward: 'Khung ảnh Y2K Cyber Edition',
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Top Banner */}
      <div className="y2k-panel rounded-3xl p-6 shadow-md border border-[#bce0fb] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ffd700] to-[#ff9900] flex items-center justify-center text-white shadow-md border-2 border-white flex-shrink-0 animate-bounce">
            <Trophy className="w-9 h-9 fill-current" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#264e73] mb-1">
              BẢNG VÀNG THÀNH TÍCH
            </h2>
            <p className="text-xs sm:text-sm text-[#5d83a4]">
              Kỷ lục bắn vịt và các cột mốc photobooth bạn đã chinh phục!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border border-[#bde0fa] text-center shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-[#6286a7]">Kỷ lục bắn vịt</span>
            <span className="text-xl font-black text-[#ff4766]">{highScore}đ</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white border border-[#bde0fa] text-center shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-[#6286a7]">Ảnh đã tạo</span>
            <span className="text-xl font-black text-[#2e7ec4]">{snapsCount}</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`y2k-panel rounded-2xl p-4 flex flex-col justify-between gap-3 border transition-all duration-300 ${
              badge.unlocked
                ? 'bg-white/95 border-[#87c4f1] shadow-md hover:-translate-y-1'
                : 'bg-gray-100/70 border-gray-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{badge.icon}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    badge.unlocked
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {badge.unlocked ? 'ĐÃ ĐẠT' : 'CHƯA ĐẠT'}
                </span>
              </div>

              <h3 className="font-black text-sm text-[#274c6e] mb-1">{badge.title}</h3>
              <p className="text-xs text-[#6b8ba9] leading-relaxed mb-2">{badge.desc}</p>
            </div>

            {badge.unlocked && (
              <button
                onClick={() => {
                  sounds.playPop();
                  onGoToPhotoboothWithTrophy(badge.title, highScore);
                }}
                className="y2k-pill-btn w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#5caeeb] to-[#3a92d7] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm border border-white"
              >
                <Camera className="w-3.5 h-3.5" />
                Đưa Vào Photobooth
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

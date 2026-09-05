'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { sounds } from '@/utils/audio';

interface TrophyRoomProps {
  highScore: number;
  snapsCount: number;
  onGoToPhotoboothWithTrophy: (title: string, score: number) => void;
  onResetData?: () => void;
}

export const TrophyRoom: React.FC<TrophyRoomProps> = ({
  highScore,
  snapsCount,
  onGoToPhotoboothWithTrophy,
  onResetData,
}) => {
  const badges = [
    {
      id: 1,
      title: 'Tân Binh Thiện Xạ',
      desc: 'Đạt ít nhất 200 điểm khi bắn vịt',
      unlocked: highScore >= 200,
    },
    {
      id: 2,
      title: 'Bách Phát Bách Trúng',
      desc: 'Đạt trên 800 điểm trong phòng săn vịt',
      unlocked: highScore >= 800,
    },
    {
      id: 3,
      title: 'Huyền Thoại Bắn Vịt',
      desc: 'Đạt đỉnh cao 1500+ điểm',
      unlocked: highScore >= 1500,
    },
    {
      id: 4,
      title: 'Nhiếp Ảnh Gia',
      desc: 'Tạo và lưu lại ít nhất 1 bức ảnh',
      unlocked: snapsCount >= 1,
    },
    {
      id: 5,
      title: 'Bộ Sưu Tập Kỷ Niệm',
      desc: 'Tạo từ 3 bức ảnh photobooth trở lên',
      unlocked: snapsCount >= 3,
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#121218] mb-1 tracking-tight">
            BẢNG THÀNH TÍCH
          </h2>
          <p className="text-xs sm:text-sm text-[#5a6275]">
            Kỷ lục bắn vịt và các cột mốc photobooth bạn đã chinh phục.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-white/70 border border-white/90 text-center shadow-xs">
            <span className="block text-[10px] uppercase font-bold text-[#6a7288]">Kỷ lục bắn vịt</span>
            <span className="text-xl font-black text-[#8b5cf6]">{highScore}đ</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/70 border border-white/90 text-center shadow-xs">
            <span className="block text-[10px] uppercase font-bold text-[#6a7288]">Ảnh đã tạo</span>
            <span className="text-xl font-black text-[#121218]">{snapsCount}</span>
          </div>
          {onResetData && (
            <button
              onClick={onResetData}
              className="px-3 py-2.5 rounded-xl bg-white/60 hover:bg-white border border-white/90 text-[#4c5468] hover:text-red-600 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs"
              title="Làm mới và xóa bộ nhớ đã lưu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`glass-card rounded-xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 ${
              badge.unlocked
                ? 'bg-white/80 shadow-xs hover:-translate-y-0.5'
                : 'bg-white/30 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#8b5cf6] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  MỤC TIÊU #{badge.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    badge.unlocked
                      ? 'bg-purple-100 text-[#6d40c6] border border-purple-200'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {badge.unlocked ? 'ĐÃ ĐẠT' : 'CHƯA ĐẠT'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#181b24] mb-1">{badge.title}</h3>
              <p className="text-xs text-[#5d6579] leading-relaxed mb-2">{badge.desc}</p>
            </div>

            {badge.unlocked && (
              <button
                onClick={() => {
                  sounds.playPop();
                  onGoToPhotoboothWithTrophy(badge.title, highScore);
                }}
                className="dark-pill-btn w-full py-2.5 px-4 rounded-lg text-xs font-bold hover:scale-102 transition-transform"
              >
                Gắn Vào Photobooth
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

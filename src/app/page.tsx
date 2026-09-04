'use client';

import React, { useState, useEffect } from 'react';
import { ConsoleHeader } from '@/components/ConsoleHeader';
import { Sidebar } from '@/components/Sidebar';
import { Photobooth } from '@/components/Photobooth';
import { DuckHunt } from '@/components/DuckHunt';
import { TrophyRoom } from '@/components/TrophyRoom';
import { Camera, Target, Trophy, Sparkles, ArrowUpRight, Play, Award, CheckCircle2 } from 'lucide-react';
import { sounds } from '@/utils/audio';

export default function Home() {
  const [currentRoom, setRoom] = useState<'photobooth' | 'duckhunt' | 'trophy'>('photobooth');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [highScore, setHighScore] = useState<number>(0);
  const [snapsCount, setSnapsCount] = useState<number>(0);
  const [bonusBadge, setBonusBadge] = useState<{ score: number; title: string } | null>(null);

  // Load stats from LocalStorage
  useEffect(() => {
    try {
      const savedScore = localStorage.getItem('quack_high_score');
      if (savedScore) setHighScore(parseInt(savedScore, 10));

      const savedSnaps = localStorage.getItem('quack_snaps_count');
      if (savedSnaps) setSnapsCount(parseInt(savedSnaps, 10));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Update High Score
  const handleScoreUpdate = (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem('quack_high_score', newScore.toString());
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Update Photo Snap Count
  const handlePhotoSaved = () => {
    const updated = snapsCount + 1;
    setSnapsCount(updated);
    try {
      localStorage.setItem('quack_snaps_count', updated.toString());
    } catch (e) {
      console.warn(e);
    }
  };

  // Switch to Photobooth with trophy/badge
  const handleSendToPhotobooth = (score: number, title: string) => {
    setBonusBadge({ score, title });
    setRoom('photobooth');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-purple-200 selection:text-purple-900">
      
      {/* 1. Global Sticky Navbar with Single Expanding Frosted Backdrop */}
      <ConsoleHeader
        currentRoom={currentRoom}
        setRoom={setRoom}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* 2. Surreal Open Horizon Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-14 pb-24 sm:pb-36 lg:pb-44 min-h-[84vh] sm:min-h-[88vh] flex flex-col justify-center z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Content: Crisp Modern Typography & Editorial Aesthetic */}
          <div className="lg:col-span-8 flex flex-col items-start gap-5">
            {/* Crisp Badge Subtitle */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/60 backdrop-blur-md border border-white/85 text-xs font-bold text-[#6d4bc4] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <span>Redefining visual studio & play</span>
            </div>

            {/* Heading with organic vector flourish */}
            <div className="relative">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#111217] tracking-tight leading-[1.08]">
                Make sense <br />
                <span className="inline-flex items-center gap-3">
                  of it all
                  <svg
                    className="hidden sm:inline-block w-24 h-8 text-[#8b5cf6] opacity-80"
                    viewBox="0 0 100 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 16 C25 2, 45 30, 70 12 C85 0, 96 24, 76 22 C65 20, 80 8, 98 16"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="98" cy="16" r="3.5" fill="#8b5cf6" />
                  </svg>
                </span>
              </h1>
            </div>

            {/* Editorial Subtitle */}
            <p className="text-base sm:text-lg text-[#474f63] max-w-xl font-normal leading-relaxed">
              Một không gian mở tự do kết hợp giữa phòng chụp ảnh Photobooth và trò chơi bắn vịt Arcade cổ điển.
              Lưu giữ từng khoảnh khắc cảm xúc cùng giai điệu của Obito.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  sounds.playPop();
                  const target = document.getElementById('studio-deck');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="dark-pill-btn px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 group"
              >
                <span>Khám phá studio ngay</span>
                <ArrowUpRight className="w-4 h-4 text-[#fda4af] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  sounds.playPop();
                  setRoom('duckhunt');
                  const target = document.getElementById('studio-deck');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="glass-pill-btn px-5 py-3 rounded-xl bg-white/70 hover:bg-white text-[#181b24] font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/90"
              >
                <div className="w-5 h-5 rounded-md bg-[#8b5cf6] text-white flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Thử tài bắn vịt</span>
              </button>
            </div>

            {/* Crisp Frosted Glass Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <div className="glass-badge px-4 py-2.5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100/80 flex items-center justify-center text-[#7c3aed]">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-bold uppercase text-[#737c94] tracking-wider">
                    Photobooth
                  </span>
                  <span className="text-xs font-bold text-[#14161f]">
                    Khung 4K & Bộ Lọc
                  </span>
                </div>
              </div>

              <div className="glass-badge px-4 py-2.5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100/80 flex items-center justify-center text-[#db2777]">
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-bold uppercase text-[#737c94] tracking-wider">
                    Arcade Game
                  </span>
                  <span className="text-xs font-bold text-[#14161f]">
                    Duck Hunt 60 FPS
                  </span>
                </div>
              </div>

              <div className="glass-badge px-4 py-2.5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100/80 flex items-center justify-center text-[#4f46e5]">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-bold uppercase text-[#737c94] tracking-wider">
                    Âm Nhạc Obito
                  </span>
                  <span className="text-xs font-bold text-[#14161f]">
                    Our Vintage Look & Soju
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero: Modern Status Card */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
            <div className="glass-card rounded-2xl p-5 max-w-xs w-full shadow-md flex flex-col gap-4 border border-white/95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#545b6e]">
                    Energy flow
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#8b5cf6] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  Real-time
                </span>
              </div>

              {/* Center Floating Orb & Wave */}
              <div className="flex items-center justify-between gap-4 py-1">
                {/* 3D Sphere Orb */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#7c3aed] via-[#c084fc] to-[#f472b6] shadow-[0_6px_16px_rgba(139,92,246,0.3)] flex items-center justify-center floating-orb-1 flex-shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-white/40 blur-[1px] -translate-x-1.5 -translate-y-1.5" />
                </div>

                {/* Micro info & sparkline */}
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#1a1c24]">
                    Không Gian Mở
                  </span>
                  <span className="text-[11px] text-[#6b7388]">
                    Hiệu năng mượt mà, không giới hạn.
                  </span>
                  <svg className="w-20 h-5 text-[#8b5cf6]" viewBox="0 0 100 24" fill="none">
                    <path
                      d="M0 12 Q25 0 50 12 T100 12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom Mini Metrics */}
              <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px] font-semibold text-[#545b6e]">
                <span>Điểm kỷ lục: <strong className="text-[#121218]">{highScore}</strong></span>
                <span>Ảnh đã lưu: <strong className="text-[#8b5cf6]">{snapsCount}</strong></span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Main Studio Workspace */}
      <main id="studio-deck" className="relative w-full px-3 sm:px-6 lg:px-10 scroll-mt-24 sm:scroll-mt-28 pt-8 sm:pt-14 pb-32 sm:pb-48 lg:pb-60 z-20 min-h-[88vh] flex flex-col justify-center">
        <div className="glass-panel rounded-2xl p-4 sm:p-7 lg:p-8 flex flex-col gap-6 shadow-xl w-full">
          
          {/* Deck Interior Layout */}
          <div className="flex flex-col lg:flex-row gap-7 items-start w-full">
            
            {/* Left Column: Floating Sidebar */}
            <div className="hidden lg:block">
              <Sidebar
                currentRoom={currentRoom}
                setRoom={setRoom}
                highScore={highScore}
                snapsCount={snapsCount}
              />
            </div>

            {/* Center Stage: Active Room */}
            <div className="w-full flex-1 flex flex-col min-h-[580px]">
              {currentRoom === 'photobooth' && (
                <Photobooth
                  bonusBadge={bonusBadge}
                  onPhotoSaved={handlePhotoSaved}
                />
              )}

              {currentRoom === 'duckhunt' && (
                <DuckHunt
                  onSendToPhotobooth={handleSendToPhotobooth}
                  onScoreUpdate={handleScoreUpdate}
                  highScore={highScore}
                />
              )}

              {currentRoom === 'trophy' && (
                <TrophyRoom
                  highScore={highScore}
                  snapsCount={snapsCount}
                  onGoToPhotoboothWithTrophy={(title, score) => {
                    handleSendToPhotobooth(score, title);
                  }}
                />
              )}
            </div>
          </div>

        </div>
      </main>

      {/* 4. Professional Modern Footer */}
      <footer className="w-full border-t border-white/50 bg-white/40 backdrop-blur-xl py-16 sm:py-20 px-4 sm:px-8 mt-20 sm:mt-32 z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          
          {/* Top Multi-column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Col 1 & 2: Brand & Mission */}
            <div className="lg:col-span-2 flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Logo_QuackQuack.png"
                  alt="Quack Studio Logo"
                  className="w-7 h-7 rounded-lg object-contain shadow-xs"
                />
                <span className="text-base font-extrabold tracking-tight text-[#14151c]">
                  Quack<span className="text-[#8b5cf6]">.</span>studio
                </span>
              </div>
              <p className="text-xs text-[#5a6275] max-w-sm leading-relaxed">
                Nền tảng kết hợp chụp ảnh photobooth nghệ thuật và trò chơi arcade bắn vịt 60 FPS.
                Được thiết kế với tư duy không gian mở, mang đến trải nghiệm sáng tạo tinh tế và liền mạch.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-[#485062]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Hệ thống vận hành mượt mà • Web Audio API</span>
              </div>
            </div>

            {/* Col 3: Không Gian Studio */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-extrabold text-[#1a1e28] uppercase tracking-wider">
                Không Gian
              </span>
              <ul className="flex flex-col gap-2 text-xs text-[#5a6275]">
                <li>
                  <button
                    onClick={() => { sounds.playPop(); setRoom('photobooth'); }}
                    className="hover:text-[#121218] transition-colors text-left"
                  >
                    Phòng Photobooth
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { sounds.playPop(); setRoom('duckhunt'); }}
                    className="hover:text-[#121218] transition-colors text-left"
                  >
                    Game Bắn Vịt Arcade
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { sounds.playPop(); setRoom('trophy'); }}
                    className="hover:text-[#121218] transition-colors text-left"
                  >
                    Bảng Thành Tích & Huy Hiệu
                  </button>
                </li>
                <li>
                  <span className="text-neutral-400">Xuất ảnh độ phân giải cao (4K PNG)</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Âm Nhạc Obito */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-extrabold text-[#1a1e28] uppercase tracking-wider">
                Playlist Âm Nhạc
              </span>
              <ul className="flex flex-col gap-2 text-xs text-[#5a6275]">
                <li className="hover:text-[#121218] transition-colors">
                  Our Vintage Look (Obito)
                </li>
                <li className="hover:text-[#121218] transition-colors">
                  Soju Love (Obito)
                </li>
                <li className="hover:text-[#121218] transition-colors">
                  Hỗ trợ tải lên file MP3 tùy chọn
                </li>
                <li className="text-neutral-400">
                  Vinyl Engine tự động chuyển bài
                </li>
              </ul>
            </div>

            {/* Col 5: Kỹ Thuật & Thông Tin */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-extrabold text-[#1a1e28] uppercase tracking-wider">
                Nền Tảng
              </span>
              <ul className="flex flex-col gap-2 text-xs text-[#5a6275]">
                <li>Phiên bản: <strong className="text-[#121218] font-bold">v2.5 Studio</strong></li>
                <li>Framework: Next.js (App Router)</li>
                <li>Giao diện: Frosted Glassmorphism</li>
                <li>Lưu trữ: LocalStorage an toàn</li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Terms */}
          <div className="pt-6 border-t border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6e778d]">
            <p>
              © {new Date().getFullYear()} Quack Studio. Thiết kế hướng tới trải nghiệm người dùng hiện đại và chuyên nghiệp.
            </p>
            <div className="flex items-center gap-5 text-[11px]">
              <span className="hover:text-[#121218] cursor-pointer transition-colors">Điều khoản</span>
              <span>•</span>
              <span className="hover:text-[#121218] cursor-pointer transition-colors">Quyền riêng tư</span>
              <span>•</span>
              <span className="hover:text-[#121218] cursor-pointer transition-colors">Tài liệu hướng dẫn</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 5. Mobile Bottom Navigation Dock */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="glass-nav rounded-xl p-1.5 shadow-xl flex items-center justify-around border border-white/90">
          <button
            onClick={() => {
              sounds.playPop();
              setRoom('photobooth');
            }}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg transition-all ${
              currentRoom === 'photobooth'
                ? 'bg-[#121218] text-white shadow-xs'
                : 'text-[#444b5d] hover:bg-white/40'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-xs font-bold">Photobooth</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setRoom('duckhunt');
            }}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg transition-all ${
              currentRoom === 'duckhunt'
                ? 'bg-[#121218] text-white shadow-xs'
                : 'text-[#444b5d] hover:bg-white/40'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="text-xs font-bold">Bắn Vịt</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setRoom('trophy');
            }}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg transition-all ${
              currentRoom === 'trophy'
                ? 'bg-[#121218] text-white shadow-xs'
                : 'text-[#444b5d] hover:bg-white/40'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold">Thành Tích</span>
          </button>
        </div>
      </div>

    </div>
  );
}

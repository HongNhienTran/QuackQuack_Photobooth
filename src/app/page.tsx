'use client';

import React, { useState, useEffect } from 'react';
import { ConsoleHeader } from '@/components/ConsoleHeader';
import { Sidebar } from '@/components/Sidebar';
import { Photobooth } from '@/components/Photobooth';
import { DuckHunt } from '@/components/DuckHunt';
import { TrophyRoom } from '@/components/TrophyRoom';
import { Camera, Target, Trophy } from 'lucide-react';
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
    <main className="min-h-screen py-4 sm:py-8 px-2 sm:px-6 flex flex-col items-center justify-start">
      {/* Outer Retro Handheld Console Container */}
      <div className="y2k-console-outer w-full max-w-6xl rounded-[2.5rem] p-3 sm:p-6 flex flex-col gap-4 shadow-2xl relative">
        
        {/* Top Console Notch & Header */}
        <ConsoleHeader
          currentRoom={currentRoom}
          setRoom={setRoom}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        {/* Main Console Interior Display */}
        <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
          {/* Left Side: Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              currentRoom={currentRoom}
              setRoom={setRoom}
              highScore={highScore}
              snapsCount={snapsCount}
            />
          </div>

          {/* Center Stage: Active Room */}
          <div className="w-full flex-1 flex flex-col min-h-[560px]">
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

        {/* Console Bottom Bar Info */}
        <footer className="mt-4 pt-3 border-t border-white/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-[#557b9e] px-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span>QUACK-OS 2.0 • Y2K CYBER EDITION</span>
          </div>
          <div>
            <span>Dành cho Web & Mobile • Vercel Ready ⚡</span>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar (Float on small screens for easy thumb access) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 border-2 border-[#bde0fa] shadow-xl flex items-center justify-around">
          <button
            onClick={() => {
              sounds.playPop();
              setRoom('photobooth');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
              currentRoom === 'photobooth'
                ? 'bg-[#3b93d7] text-white shadow-sm scale-105'
                : 'text-[#356087]'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px] font-black">Photobooth</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setRoom('duckhunt');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
              currentRoom === 'duckhunt'
                ? 'bg-[#3b93d7] text-white shadow-sm scale-105'
                : 'text-[#356087]'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-black">Bắn Vịt</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setRoom('trophy');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
              currentRoom === 'trophy'
                ? 'bg-[#3b93d7] text-white shadow-sm scale-105'
                : 'text-[#356087]'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-black">Thành Tích</span>
          </button>
        </div>
      </div>
    </main>
  );
}

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Download, RefreshCw, Sparkles, Heart, Trash2, Sliders, Image as ImageIcon } from 'lucide-react';
import { sounds } from '@/utils/audio';
import confetti from 'canvas-confetti';

interface StickerItem {
  id: number;
  text: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

interface PhotoboothProps {
  bonusBadge?: { score: number; title: string } | null;
  onPhotoSaved: () => void;
}

export const Photobooth: React.FC<PhotoboothProps> = ({ bonusBadge, onPhotoSaved }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [selectedFrame, setSelectedFrame] = useState<'console' | 'photocard' | 'polaroid' | 'wanted' | 'fourcut'>('console');
  const [selectedFilter, setSelectedFilter] = useState<'normal' | 'pastel' | 'vintage' | 'bw' | 'cyber'>('normal');
  const [captionText, setCaptionText] = useState<string>('Quack! Cute Moments ✨');
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera start / stop
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Cannot access camera or permission denied:', err);
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  // Mount / Unmount camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // If bonusBadge was received from DuckHunt, add it as a sticker
  useEffect(() => {
    if (bonusBadge) {
      setStickers((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `🏆 ${bonusBadge.title}: ${bonusBadge.score}đ`,
          x: 200,
          y: 60,
          size: 26,
          rotation: -5,
        },
      ]);
    }
  }, [bonusBadge]);

  // Snap countdown
  const triggerCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);
    sounds.playPop();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          takeSnapshot();
          return null;
        }
        sounds.playPop();
        return prev - 1;
      });
    }, 1000);
  };

  // Capture frame from webcam
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.width = video.videoWidth || 640;
    hiddenCanvas.height = video.videoHeight || 480;
    const ctx = hiddenCanvas.getContext('2d');
    if (!ctx) return;

    // Mirror snapshot
    ctx.translate(hiddenCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

    sounds.playShutter();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const dataUrl = hiddenCanvas.toDataURL('image/png');
    setPhotoData(dataUrl);
    stopCamera();
  };

  // Upload file from computer/phone
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoData(event.target.result as string);
        stopCamera();
        sounds.playPop();
      }
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    sounds.playPop();
    setPhotoData(null);
    startCamera();
  };

  // Add Sticker
  const addSticker = (text: string) => {
    sounds.playPop();
    const newSticker: StickerItem = {
      id: Date.now(),
      text,
      x: 180 + Math.random() * 60,
      y: 200 + Math.random() * 60,
      size: 34,
      rotation: Math.floor((Math.random() - 0.5) * 20),
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Remove Selected Sticker
  const removeSelectedSticker = () => {
    if (!selectedStickerId) return;
    sounds.playPop();
    setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId));
    setSelectedStickerId(null);
  };

  // Mouse / Touch Dragging on Stickers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scale;
    const mouseY = (e.clientY - rect.top) * scale;

    // Check hit on stickers (from top to bottom)
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      const dist = Math.hypot(mouseX - s.x, mouseY - s.y);
      if (dist < s.size * 1.3) {
        setSelectedStickerId(s.id);
        setIsDragging(true);
        setDragOffset({ x: mouseX - s.x, y: mouseY - s.y });
        return;
      }
    }
    setSelectedStickerId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedStickerId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scale;
    const mouseY = (e.clientY - rect.top) * scale;

    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedStickerId
          ? { ...s, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y }
          : s
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Redraw Complete Final Photobooth Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 750;
    canvas.width = width;
    canvas.height = height;

    // Background based on Frame style
    if (selectedFrame === 'console') {
      // Y2K Icy Baby Blue Console Frame (Matching User's Reference)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#cae4fa');
      bgGrad.addColorStop(0.5, '#b9ddf9');
      bgGrad.addColorStop(1, '#9ecbee');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer White Glossy Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, width - 14, height - 14);

      // Console Header Notch
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(width * 0.32, 14, width * 0.36, 42, [0, 0, 18, 18]);
      ctx.fill();
      ctx.strokeStyle = '#b2daf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#296395';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Rude! Quack', width * 0.5, 42);

      // Top Hearts
      ctx.fillStyle = '#ff4766';
      ctx.font = '22px sans-serif';
      ctx.fillText('❤️', 42, 45);
      ctx.fillText('❤️', width - 42, 45);

      // Speaker vent lines on sides
      ctx.fillStyle = '#89bfe8';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(20, 160 + i * 14, 16, 5);
        ctx.fillRect(width - 36, 160 + i * 14, 16, 5);
      }
    } else if (selectedFrame === 'photocard') {
      // K-Pop Photocard
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#fde2e4');
      bgGrad.addColorStop(0.5, '#e2ece9');
      bgGrad.addColorStop(1, '#bee1e6');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, width - 16, height - 16);

      ctx.fillStyle = '#2b4461';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Hearts2Hearts ★ IDOL PASS', width * 0.5, 52);
    } else if (selectedFrame === 'polaroid') {
      // Vintage Polaroid
      ctx.fillStyle = '#fbf9f5';
      ctx.fillRect(0, 0, width, height);

      // Polaroid shadow
      ctx.strokeStyle = '#e2dfd8';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);
    } else if (selectedFrame === 'wanted') {
      // Wanted Poster
      ctx.fillStyle = '#eed9b7';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#6b4423';
      ctx.lineWidth = 6;
      ctx.strokeRect(18, 18, width - 36, height - 36);

      ctx.fillStyle = '#4a2d13';
      ctx.font = '900 44px serif';
      ctx.textAlign = 'center';
      ctx.fillText('W A N T E D', width * 0.5, 75);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('DEAD OR QUACKED', width * 0.5, 105);
    } else if (selectedFrame === 'fourcut') {
      // Korean 4-Cut Studio Strip
      ctx.fillStyle = '#d9ecfa';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 20, width - 40, height - 40);
    }

    // Photo Area Box
    let photoX = 50;
    let photoY = 75;
    let photoW = width - 100;
    let photoH = height - 210;

    if (selectedFrame === 'wanted') {
      photoY = 125;
      photoH = height - 280;
    } else if (selectedFrame === 'polaroid') {
      photoX = 40;
      photoY = 40;
      photoW = width - 80;
      photoH = height - 160;
    }

    // Draw Photo or Placeholder
    if (photoData) {
      const img = new Image();
      img.src = photoData;
      if (img.complete) {
        renderImageWithFilters(ctx, img, photoX, photoY, photoW, photoH);
      } else {
        img.onload = () => {
          renderImageWithFilters(ctx, img, photoX, photoY, photoW, photoH);
        };
      }
    } else {
      // Empty placeholder in canvas
      ctx.fillStyle = '#e8f3fc';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.strokeStyle = '#b9ddf9';
      ctx.lineWidth = 2;
      ctx.strokeRect(photoX, photoY, photoW, photoH);

      ctx.fillStyle = '#5a8cb5';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Bấm "Chụp Ảnh" hoặc "Tải Ảnh Lên"', width * 0.5, photoY + photoH * 0.48);
      ctx.fillText('để bắt đầu tạo khung hình nhé! ✨', width * 0.5, photoY + photoH * 0.54);
    }

    // Draw Caption Text
    ctx.textAlign = 'center';
    if (selectedFrame === 'polaroid') {
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'italic bold 22px cursive, sans-serif';
      ctx.fillText(captionText, width * 0.5, height - 60);
    } else if (selectedFrame === 'wanted') {
      ctx.fillStyle = '#5c391b';
      ctx.font = 'bold 24px serif';
      ctx.fillText('BOUNTY: $500,000,000', width * 0.5, height - 100);
      ctx.font = '16px sans-serif';
      ctx.fillText(captionText, width * 0.5, height - 65);
    } else if (selectedFrame === 'console') {
      // Bottom Console Pill Bar
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(photoX + 20, height - 105, photoW - 40, 50, 16);
      ctx.fill();
      ctx.strokeStyle = '#b9dcf7';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#275279';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(captionText, width * 0.5, height - 74);
    }

    // Draw Stickers
    stickers.forEach((s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.rotation * Math.PI) / 180);

      // If text is a score badge
      if (s.text.startsWith('🏆')) {
        ctx.fillStyle = '#ff4766';
        ctx.beginPath();
        ctx.roundRect(-120, -20, 240, 40, 12);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.text, 0, 6);
      } else {
        // Emoji / text sticker
        ctx.font = `${s.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.text, 0, 0);

        // Highlight ring if selected
        if (s.id === selectedStickerId) {
          ctx.strokeStyle = '#5daeec';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(-s.size * 0.7, -s.size * 0.7, s.size * 1.4, s.size * 1.4);
          ctx.setLineDash([]);
        }
      }

      ctx.restore();
    });
  }, [photoData, selectedFrame, selectedFilter, captionText, stickers, selectedStickerId]);

  // Apply visual filters onto image
  const renderImageWithFilters = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    ctx.save();
    // Crop & center object-fit cover
    const imgAspect = img.width / img.height;
    const boxAspect = w / h;
    let sx = 0,
      sy = 0,
      sw = img.width,
      sh = img.height;

    if (imgAspect > boxAspect) {
      sw = img.height * boxAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / boxAspect;
      sy = (img.height - sh) / 2;
    }

    if (selectedFilter === 'bw') {
      ctx.filter = 'grayscale(100%) contrast(120%)';
    } else if (selectedFilter === 'pastel') {
      ctx.filter = 'brightness(108%) saturate(125%) hue-rotate(5deg)';
    } else if (selectedFilter === 'vintage') {
      ctx.filter = 'sepia(45%) contrast(95%) brightness(102%)';
    } else if (selectedFilter === 'cyber') {
      ctx.filter = 'saturate(160%) contrast(115%)';
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();

    // Subtle gloss overlay
    const glossGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    glossGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
    glossGrad.addColorStop(1, 'rgba(0, 0, 0, 0.02)');
    ctx.fillStyle = glossGrad;
    ctx.fillRect(x, y, w, h);
  };

  // Download Output PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    sounds.playVictory();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });

    const link = document.createElement('a');
    link.download = `QuackBooth_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onPhotoSaved();
  };

  const frames = [
    { id: 'console', label: '🩵 Y2K Console' },
    { id: 'photocard', label: '🌸 K-Pop Card' },
    { id: 'polaroid', label: '📸 Polaroid 90s' },
    { id: 'wanted', label: '🤠 Lệnh Truy Nã' },
    { id: 'fourcut', label: '🎞️ 4-Cut Studio' },
  ] as const;

  const filters = [
    { id: 'normal', label: 'Tự Nhiên' },
    { id: 'pastel', label: 'Pastel Cute' },
    { id: 'vintage', label: 'Vintage 90s' },
    { id: 'bw', label: 'Đen Trắng' },
    { id: 'cyber', label: 'Cyber Pop' },
  ] as const;

  const quickStickers = [
    '🦆', '🐥', '🕶️', '👑', '🎀', '💖', '⭐', '🔫', '✨', '🔥', '🎉', '💥',
  ];

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-6 items-start max-w-5xl mx-auto w-full">
      {/* Left: Interactive Controls / Camera Feed */}
      <div className="w-full xl:w-7/12 flex flex-col gap-4">
        {/* Camera Live Preview or Photo Result */}
        <div className="y2k-panel rounded-3xl p-4 flex flex-col gap-3 shadow-md border border-[#bce0fb]">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border-2 border-white shadow-inner flex items-center justify-center">
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                photoData ? 'hidden' : 'block'
              }`}
            />

            {/* Flash Effect */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-300 pointer-events-none" />
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center">
                <span className="text-8xl font-black text-white drop-shadow-[0_4px_16px_rgba(255,71,102,0.8)] animate-ping">
                  {countdown}
                </span>
              </div>
            )}

            {/* If photo is taken, show static snapshot message */}
            {photoData && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center text-white">
                <div>
                  <Sparkles className="w-10 h-10 text-yellow-300 mx-auto mb-2 animate-bounce" />
                  <p className="font-extrabold text-base mb-3">Đã chụp ảnh thành công! 📸</p>
                  <button
                    onClick={handleRetake}
                    className="y2k-pill-btn px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 mx-auto border border-white/40"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Chụp Lại Ảnh Khác
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {!photoData ? (
              <button
                onClick={triggerCountdown}
                disabled={countdown !== null}
                className="y2k-pill-btn flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff4766] to-[#ff7a91] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md border-2 border-white"
              >
                <Camera className="w-5 h-5" />
                CHỤP ẢNH (3S FLASH)
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="y2k-pill-btn flex-1 py-3 px-4 rounded-2xl bg-[#edf6fd] text-[#2c5b85] font-black text-sm flex items-center justify-center gap-2 border border-[#b8ddf9]"
              >
                <RefreshCw className="w-4 h-4" />
                Chụp Lại
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="y2k-pill-btn py-3 px-4 rounded-2xl bg-white hover:bg-[#f4faff] text-[#2a557d] font-bold text-xs flex items-center gap-2 border border-[#b8ddf9]"
            >
              <Upload className="w-4 h-4 text-[#3585c5]" />
              Tải Ảnh Lên
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Customization Options: Frames & Filters */}
        <div className="y2k-panel rounded-3xl p-4 flex flex-col gap-4 shadow-sm">
          {/* Frame Selection */}
          <div>
            <span className="text-xs font-black text-[#2a567f] uppercase tracking-wider block mb-2">
              1. Chọn Kiểu Khung Ảnh
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {frames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => {
                    sounds.playPop();
                    setSelectedFrame(frame.id);
                  }}
                  className={`y2k-pill-btn py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedFrame === frame.id
                      ? 'bg-[#3b93d7] text-white border-transparent shadow-sm scale-105'
                      : 'bg-white text-[#2c5378] border-[#c0e2fa] hover:bg-[#edf6fd]'
                  }`}
                >
                  {frame.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Selection */}
          <div>
            <span className="text-xs font-black text-[#2a567f] uppercase tracking-wider block mb-2">
              2. Bộ Lọc Màu
            </span>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    sounds.playPop();
                    setSelectedFilter(f.id);
                  }}
                  className={`y2k-pill-btn py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedFilter === f.id
                      ? 'bg-pink-500 text-white border-transparent shadow-sm scale-105'
                      : 'bg-white text-[#3c668d] border-[#c0e2fa] hover:bg-[#edf6fd]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sticker Tray */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-[#2a567f] uppercase tracking-wider">
                3. Dán Sticker Vui Nhộn
              </span>
              {selectedStickerId && (
                <button
                  onClick={removeSelectedSticker}
                  className="text-[11px] font-bold text-red-500 flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa sticker chọn
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickStickers.map((sticker, idx) => (
                <button
                  key={idx}
                  onClick={() => addSticker(sticker)}
                  className="y2k-pill-btn w-9 h-9 rounded-xl bg-white hover:bg-pink-50 text-lg flex items-center justify-center border border-[#bfe1fb] shadow-sm"
                  title="Chạm để dán lên ảnh"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <span className="text-xs font-black text-[#2a567f] uppercase tracking-wider block mb-1.5">
              4. Lời Tựa Khung Ảnh
            </span>
            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              maxLength={40}
              placeholder="Nhập chữ hiển thị trên khung ảnh..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#bde1fa] text-xs font-bold text-[#2a547b] focus:outline-none focus:ring-2 focus:ring-[#7ec3f3]"
            />
          </div>
        </div>
      </div>

      {/* Right: Realtime Canvas Output & Download */}
      <div className="w-full xl:w-5/12 flex flex-col gap-3">
        <div className="y2k-panel rounded-3xl p-4 flex flex-col items-center gap-3 shadow-md border border-[#bce0fb]">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-black text-[#27537b] uppercase tracking-wider">
              Khung Ảnh Thành Phẩm
            </span>
            <span className="text-[10px] font-bold text-pink-500">
              * Kéo thả sticker trực tiếp trên ảnh!
            </span>
          </div>

          {/* Canvas Preview Box */}
          <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className="w-full h-full block cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="y2k-pill-btn w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2995e8] to-[#1678c7] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg border-2 border-white hover:scale-[1.02]"
          >
            <Download className="w-5 h-5" />
            TẢI ẢNH VỀ MÁY (PNG SẮC NÉT)
          </button>
        </div>
      </div>
    </div>
  );
};

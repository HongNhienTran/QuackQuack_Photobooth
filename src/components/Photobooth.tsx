'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Download, RefreshCw, Sparkles, Heart, Trash2, Sliders, Image as ImageIcon, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { sounds } from '@/utils/audio';
import confetti from 'canvas-confetti';

interface StickerItem {
  id: number;
  text?: string;
  imageUrl?: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const AVAILABLE_STICKERS = [
  { id: 'st1', url: '/sticker/sticker_001.png', label: 'Sao Băng Cầu Vồng' },
  { id: 'st2', url: '/sticker/sticker_002.png', label: 'Hoa Anh Đào' },
  { id: 'st3', url: '/sticker/sticker_004.png', label: 'Sao Vàng Cười' },
  { id: 'st4', url: '/sticker/sticker_005.png', label: 'Cầu Vồng Mây' },
  { id: 'st5', url: '/sticker/sticker_006.png', label: 'Trái Tim Hồng' },
  { id: 'st6', url: '/sticker/sticker_007.png', label: 'Trái Tim Pastel' },
  { id: 'st7', url: '/sticker/sticker_008.png', label: 'Sao Vàng 3D' },
  { id: 'st8', url: '/sticker/sticker_009.png', label: 'Sao Pha Lê' },
  { id: 'st9', url: '/sticker/sticker_010.png', label: 'Bộ Ba Trái Tim' },
];

export type FrameType =
  | 'birthday'
  | 'crimson'
  | 'ocean'
  | 'cherry'
  | 'console'
  | 'photocard'
  | 'polaroid'
  | 'wanted'
  | 'fourcut';

const FRAME_OVERLAYS: Record<string, string> = {
  birthday: '/frames/frame_birthday_overlay.png',
  crimson: '/frames/frame_crimson_overlay.png',
  ocean: '/frames/frame_ocean_overlay.png',
  cherry: '/frames/frame_cherry_overlay.png',
};

interface PhotoboothProps {
  bonusBadge?: { score: number; title: string } | null;
  onPhotoSaved: () => void;
}

export const Photobooth: React.FC<PhotoboothProps> = ({ bonusBadge, onPhotoSaved }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stickerImagesCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const frameImagesCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>('birthday');
  const [selectedFilter, setSelectedFilter] = useState<'normal' | 'pastel' | 'vintage' | 'bw' | 'cyber'>('normal');
  const [captionText, setCaptionText] = useState<string>('Our Vintage Look');
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [stickerCacheVer, setStickerCacheVer] = useState<number>(0);
  const [frameCacheVer, setFrameCacheVer] = useState<number>(0);

  // Preload sticker images on mount
  useEffect(() => {
    AVAILABLE_STICKERS.forEach((item) => {
      const img = new Image();
      img.src = item.url;
      img.onload = () => {
        stickerImagesCache.current.set(item.url, img);
        setStickerCacheVer((v) => v + 1);
      };
      if (img.complete) {
        stickerImagesCache.current.set(item.url, img);
      }
    });

    Object.entries(FRAME_OVERLAYS).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        frameImagesCache.current.set(key, img);
        setFrameCacheVer((v) => v + 1);
      };
      if (img.complete) {
        frameImagesCache.current.set(key, img);
      }
    });
  }, []);

  // Preload photo image into an HTMLImageElement whenever photoData changes
  useEffect(() => {
    if (!photoData) {
      setLoadedImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
    };
    img.src = photoData;
    if (img.complete) {
      setLoadedImage(img);
    }
  }, [photoData]);

  // Camera start / stop
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
        videoRef.current.play().catch(() => {});
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

    let w = video.videoWidth;
    let h = video.videoHeight;
    if (!w || !h) {
      w = video.clientWidth || 640;
      h = video.clientHeight || 480;
    }

    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.width = w;
    hiddenCanvas.height = h;
    const ctx = hiddenCanvas.getContext('2d');
    if (!ctx) return;

    // Mirror snapshot
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);

    sounds.playShutter();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const dataUrl = hiddenCanvas.toDataURL('image/png');
    setPhotoData(dataUrl);

    // Pre-create image for zero-delay canvas rendering
    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
    };
    img.src = dataUrl;
    if (img.complete) {
      setLoadedImage(img);
    }

    // Freeze video display without killing stream
    video.pause();
  };

  // Upload file from computer/phone
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setPhotoData(dataUrl);

        const img = new Image();
        img.onload = () => {
          setLoadedImage(img);
        };
        img.src = dataUrl;
        if (img.complete) {
          setLoadedImage(img);
        }

        if (videoRef.current) {
          videoRef.current.pause();
        }
        sounds.playPop();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Retake photo
  const handleRetake = () => {
    sounds.playPop();
    setPhotoData(null);
    setLoadedImage(null);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Add Image Sticker
  const addImageSticker = (url: string) => {
    sounds.playPop();
    const newSticker: StickerItem = {
      id: Date.now(),
      imageUrl: url,
      x: 230 + (Math.random() - 0.5) * 80,
      y: 280 + (Math.random() - 0.5) * 80,
      size: 100,
      rotation: Math.floor((Math.random() - 0.5) * 24),
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Add Text/Emoji Sticker
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

  // Resize Selected Sticker
  const handleScaleSticker = (delta: number) => {
    if (!selectedStickerId) return;
    sounds.playPop();
    setStickers((prev) =>
      prev.map((s) => {
        if (s.id === selectedStickerId) {
          const newSize = Math.max(35, Math.min(260, s.size + delta));
          return { ...s, size: newSize };
        }
        return s;
      })
    );
  };

  // Rotate Selected Sticker
  const handleRotateSticker = (deltaAngle: number) => {
    if (!selectedStickerId) return;
    sounds.playPop();
    setStickers((prev) =>
      prev.map((s) => {
        if (s.id === selectedStickerId) {
          return { ...s, rotation: (s.rotation + deltaAngle) % 360 };
        }
        return s;
      })
    );
  };

  // Remove Selected Sticker
  const removeSelectedSticker = () => {
    if (!selectedStickerId) return;
    sounds.playPop();
    setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId));
    setSelectedStickerId(null);
  };

  // Clear All Stickers
  const clearAllStickers = () => {
    sounds.playPop();
    setStickers([]);
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
      const hitRadius = s.imageUrl ? s.size * 0.65 : (s.text?.startsWith('🏆') ? 120 : s.size * 0.8);
      if (dist < hitRadius) {
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

  // Touch handlers for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const touchX = (touch.clientX - rect.left) * scale;
    const touchY = (touch.clientY - rect.top) * scale;

    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      const dist = Math.hypot(touchX - s.x, touchY - s.y);
      const hitRadius = s.imageUrl ? s.size * 0.65 : (s.text?.startsWith('🏆') ? 120 : s.size * 0.8);
      if (dist < hitRadius) {
        setSelectedStickerId(s.id);
        setIsDragging(true);
        setDragOffset({ x: touchX - s.x, y: touchY - s.y });
        return;
      }
    }
    setSelectedStickerId(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedStickerId) return;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const touchX = (touch.clientX - rect.left) * scale;
    const touchY = (touch.clientY - rect.top) * scale;

    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedStickerId
          ? { ...s, x: touchX - dragOffset.x, y: touchY - dragOffset.y }
          : s
      )
    );
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Redraw Complete Final Photobooth Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isStoryRatio = ['birthday', 'crimson', 'ocean', 'cherry'].includes(selectedFrame);
    const width = isStoryRatio ? 576 : 600;
    const height = isStoryRatio ? 1024 : 750;
    canvas.width = width;
    canvas.height = height;

    if (selectedFrame === 'birthday') {
      const photoX = 168;
      const photoY = 265;
      const photoW = 354;
      const photoH = 485;

      ctx.fillStyle = '#eb5e85';
      ctx.fillRect(0, 0, width, height);

      if (loadedImage) {
        renderImageWithFilters(ctx, loadedImage, photoX, photoY, photoW, photoH);
      } else {
        ctx.fillStyle = '#f3f3f3';
        ctx.fillRect(photoX, photoY, photoW, photoH);
        ctx.fillStyle = '#555555';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bấm "Chụp Ảnh" hoặc "Tải Ảnh Lên"', photoX + photoW / 2, photoY + photoH * 0.47);
        ctx.fillText('để tạo thiệp Sinh Nhật nhé! 🎂', photoX + photoW / 2, photoY + photoH * 0.53);
      }

      const frameImg = frameImagesCache.current.get('birthday');
      if (frameImg && frameImg.complete) {
        ctx.drawImage(frameImg, 0, 0, width, height);
      }

      if (captionText) {
        ctx.fillStyle = '#2d5a27';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(captionText, width * 0.5, 830);
      }
    } else if (selectedFrame === 'crimson') {
      const photoX = 144;
      const photoY = 250;
      const photoW = 288;
      const photoH = 292;

      ctx.fillStyle = '#630f17';
      ctx.fillRect(0, 0, width, height);

      if (loadedImage) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoW, photoH, 22);
        ctx.clip();
        renderImageWithFilters(ctx, loadedImage, photoX, photoY, photoW, photoH);
        ctx.restore();
      } else {
        ctx.fillStyle = '#8f202b';
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoW, photoH, 22);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bấm "Chụp Ảnh" hoặc "Tải Ảnh Lên"', photoX + photoW / 2, photoY + photoH * 0.47);
        ctx.fillText('để lên đĩa phát nhạc! 🎵', photoX + photoW / 2, photoY + photoH * 0.53);
      }

      const frameImg = frameImagesCache.current.get('crimson');
      if (frameImg && frameImg.complete) {
        ctx.drawImage(frameImg, 0, 0, width, height);
      }

      if (captionText) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(captionText, 146, 595);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px sans-serif';
        ctx.fillText('Obito • Our Vintage Look', 146, 615);
      }
    } else if (selectedFrame === 'ocean') {
      const photoX = 35;
      const photoY = 110;
      const photoW = 480;
      const photoH = 750;

      ctx.fillStyle = '#1e3357';
      ctx.fillRect(0, 0, width, height);

      if (loadedImage) {
        renderImageWithFilters(ctx, loadedImage, photoX, photoY, photoW, photoH);
      } else {
        ctx.fillStyle = '#edf4fc';
        ctx.fillRect(photoX, photoY, photoW, photoH);
        ctx.fillStyle = '#1c3d70';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bấm "Chụp Ảnh" hoặc "Tải Ảnh Lên"', photoX + photoW / 2, photoY + photoH * 0.47);
        ctx.fillText('để ngắm đại dương xanh! 🌊', photoX + photoW / 2, photoY + photoH * 0.53);
      }

      const frameImg = frameImagesCache.current.get('ocean');
      if (frameImg && frameImg.complete) {
        ctx.drawImage(frameImg, 0, 0, width, height);
      }

      if (captionText) {
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(captionText, width * 0.5, 960);
      }
    } else if (selectedFrame === 'cherry') {
      const photoX = 38;
      const photoY = 125;
      const photoW = 500;
      const photoH = 740;

      ctx.fillStyle = '#fff8ed';
      ctx.fillRect(0, 0, width, height);

      if (loadedImage) {
        renderImageWithFilters(ctx, loadedImage, photoX, photoY, photoW, photoH);
      } else {
        ctx.fillStyle = '#faf4ea';
        ctx.fillRect(photoX, photoY, photoW, photoH);
        ctx.fillStyle = '#941b2c';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bấm "Chụp Ảnh" hoặc "Tải Ảnh Lên"', photoX + photoW / 2, photoY + photoH * 0.47);
        ctx.fillText('để dán vào sổ Coquette! 🍒', photoX + photoW / 2, photoY + photoH * 0.53);
      }

      const frameImg = frameImagesCache.current.get('cherry');
      if (frameImg && frameImg.complete) {
        ctx.drawImage(frameImg, 0, 0, width, height);
      }

      if (captionText) {
        ctx.fillStyle = '#9e182b';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(captionText, width * 0.5, 960);
      }
    } else {
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
        ctx.fillText('Rude!', width * 0.5, 42);

        // Top clean subtle accents
        ctx.fillStyle = '#ff4766';
        ctx.beginPath();
        ctx.arc(42, 38, 4, 0, Math.PI * 2);
        ctx.arc(width - 42, 38, 4, 0, Math.PI * 2);
        ctx.fill();

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
      if (loadedImage) {
        renderImageWithFilters(ctx, loadedImage, photoX, photoY, photoW, photoH);
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
    }

    // Draw Stickers
    stickers.forEach((s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.rotation * Math.PI) / 180);

      if (s.imageUrl) {
        let img = stickerImagesCache.current.get(s.imageUrl);
        if (!img) {
          img = new Image();
          img.src = s.imageUrl;
          stickerImagesCache.current.set(s.imageUrl, img);
        }
        if (img.complete && img.naturalWidth > 0) {
          const halfSize = s.size / 2;
          ctx.drawImage(img, -halfSize, -halfSize, s.size, s.size);
        }

        // Selection highlight ring if selected
        if (s.id === selectedStickerId) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          const boxSize = s.size * 1.05;
          ctx.strokeRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);
          ctx.setLineDash([]);
        }
      } else if (s.text && s.text.startsWith('🏆')) {
        // Score badge sticker
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

        if (s.id === selectedStickerId) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(-125, -25, 250, 50);
          ctx.setLineDash([]);
        }
      } else if (s.text) {
        // Emoji / text sticker
        ctx.font = `${s.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.text, 0, 0);

        // Highlight ring if selected
        if (s.id === selectedStickerId) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(-s.size * 0.7, -s.size * 0.7, s.size * 1.4, s.size * 1.4);
          ctx.setLineDash([]);
        }
      }

      ctx.restore();
    });
  }, [loadedImage, selectedFrame, selectedFilter, captionText, stickers, selectedStickerId, stickerCacheVer, frameCacheVer]);

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
    ctx.filter = 'none';
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

  const frames: { id: FrameType; label: string; badge?: string }[] = [
    { id: 'birthday', label: '🎂 Sinh Nhật', badge: 'Mới' },
    { id: 'crimson', label: '🎵 Crimson Player', badge: 'Mới' },
    { id: 'ocean', label: '🌊 Ocean Blue', badge: 'Mới' },
    { id: 'cherry', label: '🍒 Cherry Coquette', badge: 'Mới' },
    { id: 'console', label: 'Console Y2K' },
    { id: 'photocard', label: 'Idol Card' },
    { id: 'polaroid', label: 'Polaroid 90s' },
    { id: 'wanted', label: 'Wanted Poster' },
    { id: 'fourcut', label: '4-Cut Studio' },
  ];

  const filters = [
    { id: 'normal', label: 'Gốc' },
    { id: 'pastel', label: 'Pastel' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'bw', label: 'Đen Trắng' },
    { id: 'cyber', label: 'Cyber' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Left Column: Camera Feed & Creative Controls (Open, borderless layout) */}
      <div className="w-full lg:w-7/12 flex flex-col gap-6">
        
        {/* Camera Live Preview or Snapshot Box */}
        <div className="flex flex-col gap-3.5 w-full">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-950 shadow-xl flex items-center justify-center border border-white/40">
            {/* Live Video Feed */}
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
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-20 flex items-center justify-center">
                <span className="text-8xl font-black text-white drop-shadow-[0_4px_30px_rgba(139,92,246,0.8)] animate-ping">
                  {countdown}
                </span>
              </div>
            )}

            {/* If photo is taken, show the captured snapshot image */}
            {photoData && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoData}
                  alt="Ảnh vừa chụp"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/55 backdrop-blur-md px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-lg border border-white/20">
                  <span className="text-xs text-white/90 font-bold">
                    Ảnh Đã Ghi Nhận
                  </span>
                  <button
                    onClick={handleRetake}
                    className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/30"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Chụp Lại
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Shoot & Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {!photoData ? (
              <button
                onClick={triggerCountdown}
                disabled={countdown !== null}
                className="dark-pill-btn flex-1 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
              >
                <Camera className="w-4 h-4 text-[#ec4899]" />
                CHỤP ẢNH (3 GIÂY)
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="glass-pill-btn flex-1 py-3 px-6 rounded-xl bg-white/80 hover:bg-white text-[#121218] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white shadow-xs"
              >
                <RefreshCw className="w-4 h-4 text-[#8b5cf6]" />
                Chụp Lại Ảnh Khác
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="glass-pill-btn py-3 px-5 rounded-xl bg-white/70 hover:bg-white text-[#2a2f3d] font-bold text-xs flex items-center gap-2 border border-white/80 shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#8b5cf6]" />
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

        {/* Customization Options (Open, spacious sections without rigid border enclose) */}
        <div className="flex flex-col gap-5 pt-2">
          
          {/* Frame Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-extrabold text-[#373d4d] uppercase tracking-wider">
                1. Kiểu Khung Nghệ Thuật
              </span>
              <span className="text-[11px] text-[#717a8e] font-semibold">
                9 phong cách studio (4 mẫu mới)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {frames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => {
                    sounds.playPop();
                    setSelectedFrame(frame.id);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                    selectedFrame === frame.id
                      ? 'bg-[#121218] text-white border-[#121218] shadow-xs'
                      : 'bg-white/50 text-[#444c5f] border-white/70 hover:bg-white/80'
                  }`}
                >
                  <span>{frame.label}</span>
                  {frame.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                      selectedFrame === frame.id ? 'bg-[#ec4899] text-white' : 'bg-pink-100 text-[#db2777]'
                    }`}>
                      {frame.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-extrabold text-[#373d4d] uppercase tracking-wider">
                2. Bộ Lọc Màu Điện Ảnh
              </span>
              <span className="text-[11px] text-[#717a8e] font-semibold">
                Ánh sáng & Phối màu
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    sounds.playPop();
                    setSelectedFilter(f.id);
                  }}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedFilter === f.id
                      ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-xs'
                      : 'bg-white/50 text-[#444c5f] border-white/70 hover:bg-white/80'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <span className="text-xs font-extrabold text-[#373d4d] uppercase tracking-wider block mb-2 px-1">
              3. Thông Điệp / Lời Tựa
            </span>
            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              maxLength={40}
              placeholder="Nhập chữ hiển thị trên khung ảnh..."
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/85 text-xs sm:text-sm font-semibold text-[#181b24] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 shadow-xs"
            />
          </div>

          {/* 4. Sticker Decoration Gallery */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#373d4d] uppercase tracking-wider">
                  4. Nhãn Dán Trang Trí (Stickers)
                </span>
                <span className="text-[10px] font-bold text-[#8b5cf6] bg-purple-50/90 px-2 py-0.5 rounded-md border border-purple-100">
                  {AVAILABLE_STICKERS.length} sticker
                </span>
              </div>

              {stickers.length > 0 && (
                <button
                  onClick={clearAllStickers}
                  className="text-[11px] font-bold text-neutral-500 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Xóa tất cả ({stickers.length})
                </button>
              )}
            </div>

            {/* Active Selected Sticker Quick Controls */}
            {selectedStickerId && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 font-bold text-[#5c32b5]">
                  <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  <span>Chỉnh sticker đang chọn:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleScaleSticker(-15)}
                    title="Thu nhỏ kích thước"
                    className="p-1.5 rounded-lg bg-white hover:bg-neutral-50 text-[#121218] border border-purple-200 shadow-2xs flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleScaleSticker(15)}
                    title="Phóng to kích thước"
                    className="p-1.5 rounded-lg bg-white hover:bg-neutral-50 text-[#121218] border border-purple-200 shadow-2xs flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRotateSticker(-15)}
                    title="Xoay ngược chiều kim đồng hồ"
                    className="p-1.5 rounded-lg bg-white hover:bg-neutral-50 text-[#121218] border border-purple-200 shadow-2xs flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRotateSticker(15)}
                    title="Xoay theo chiều kim đồng hồ"
                    className="p-1.5 rounded-lg bg-white hover:bg-neutral-50 text-[#121218] border border-purple-200 shadow-2xs flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={removeSelectedSticker}
                    title="Xóa nhãn dán này"
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sticker Grid Palette */}
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2.5 p-3 rounded-2xl bg-white/50 border border-white/80 shadow-xs">
              {AVAILABLE_STICKERS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => addImageSticker(st.url)}
                  title={`Dán ${st.label}`}
                  className="group relative aspect-square rounded-xl bg-white/80 hover:bg-white border border-white/90 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-center p-2 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={st.url}
                    alt={st.label}
                    className="w-full h-full object-contain filter drop-shadow-xs group-hover:rotate-6 transition-transform"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            <p className="text-[11px] text-[#6b7388] px-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#8b5cf6] flex-shrink-0" />
              <span>Bấm vào sticker để dán lên ảnh, kéo thả tự do trên khung ảnh bên phải.</span>
            </p>
          </div>

        </div>
      </div>

      {/* Right Column: Realtime Canvas Output & Download (Clean, open presentation) */}
      <div className="w-full lg:w-5/12 flex flex-col gap-4 items-center lg:items-start">
        
        {/* Output Header Status */}
        <div className={`flex items-center justify-between w-full ${['birthday', 'crimson', 'ocean', 'cherry'].includes(selectedFrame) ? 'max-w-[390px] xl:max-w-[430px]' : 'max-w-[460px] xl:max-w-[500px]'} px-1`}>
          <span className="text-xs font-extrabold text-[#373d4d] uppercase tracking-wider">
            Khung Ảnh Thành Phẩm
          </span>
          <span className="text-[10px] font-bold text-[#8b5cf6] bg-purple-50/90 px-2.5 py-0.5 rounded-md border border-purple-100">
            Preview 4K {['birthday', 'crimson', 'ocean', 'cherry'].includes(selectedFrame) ? '• 9:16' : '• 4:5'}
          </span>
        </div>

        {/* Large Crisp Canvas Box (Borderless open presentation) */}
        <div className={`relative w-full ${['birthday', 'crimson', 'ocean', 'cherry'].includes(selectedFrame) ? 'max-w-[390px] xl:max-w-[430px] aspect-[9/16]' : 'max-w-[460px] xl:max-w-[500px] aspect-[4/5]'} rounded-2xl overflow-hidden border border-white/90 shadow-2xl bg-white transition-all duration-300 flex items-center justify-center`}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
          />
        </div>

        {/* Download Action Button */}
        <button
          onClick={handleDownload}
          className={`dark-pill-btn w-full ${['birthday', 'crimson', 'ocean', 'cherry'].includes(selectedFrame) ? 'max-w-[390px] xl:max-w-[430px]' : 'max-w-[460px] xl:max-w-[500px]'} py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]`}
        >
          <Download className="w-4 h-4 text-[#fda4af]" />
          TẢI ẢNH VỀ MÁY (PNG SẮC NÉT)
        </button>
      </div>
    </div>
  );
};

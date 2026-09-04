'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '@/utils/audio';
import confetti from 'canvas-confetti';

interface Duck {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'normal' | 'speedy' | 'king' | 'bomb';
  frame: number;
  state: 'flying' | 'hit' | 'escaped';
  hitRotation: number;
  points: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

interface DuckHuntProps {
  onSendToPhotobooth: (score: number, title: string) => void;
  onScoreUpdate: (score: number) => void;
  highScore: number;
}

export const DuckHunt: React.FC<DuckHuntProps> = ({
  onSendToPhotobooth,
  onScoreUpdate,
  highScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [ammo, setAmmo] = useState<number>(6);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [combo, setCombo] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<{ shots: number; hits: number }>({ shots: 0, hits: 0 });
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Game state refs for 60fps loop
  const gameState = useRef({
    ducks: [] as Duck[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    nextDuckId: 1,
    nextTextId: 1,
    lastSpawn: 0,
    score: 0,
    ammo: 6,
    shots: 0,
    hits: 0,
    combo: 0,
    isPlaying: false,
    timeLeft: 60,
  });

  // Reload ammo
  const reloadAmmo = useCallback(() => {
    if (gameState.current.ammo === 6 || isReloading) return;
    setIsReloading(true);
    sounds.playReload();
    setTimeout(() => {
      gameState.current.ammo = 6;
      setAmmo(6);
      setIsReloading(false);
    }, 450);
  }, [isReloading]);

  // Start / Reset Game
  const startGame = useCallback(() => {
    sounds.playPop();
    setScore(0);
    setAmmo(6);
    setTimeLeft(60);
    setCombo(0);
    setGameOver(false);
    setAccuracy({ shots: 0, hits: 0 });
    setIsPlaying(true);

    gameState.current = {
      ducks: [],
      particles: [],
      floatingTexts: [],
      nextDuckId: 1,
      nextTextId: 1,
      lastSpawn: Date.now(),
      score: 0,
      ammo: 6,
      shots: 0,
      hits: 0,
      combo: 0,
      isPlaying: true,
      timeLeft: 60,
    };
  }, []);

  // Keyboard shortcut (R / Space to reload)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' || e.code === 'Space') {
        e.preventDefault();
        reloadAmmo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reloadAmmo]);

  // Game countdown timer
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          setGameOver(true);
          sounds.playVictory();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          return 0;
        }
        gameState.current.timeLeft = prev - 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  // Spawn Duck
  const spawnDuck = (canvasWidth: number, canvasHeight: number) => {
    const fromLeft = Math.random() > 0.5;
    const types: ('normal' | 'speedy' | 'king' | 'bomb')[] = [
      'normal', 'normal', 'normal', 'speedy', 'speedy', 'king', 'bomb'
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let speed = 2.5 + Math.random() * 2.5;
    let points = 100;
    let size = 48;

    if (type === 'speedy') {
      speed = 5.5 + Math.random() * 2.5;
      points = 300;
      size = 40;
    } else if (type === 'king') {
      speed = 3.2;
      points = 500;
      size = 54;
    } else if (type === 'bomb') {
      speed = 3.5;
      points = -200;
      size = 46;
    }

    const newDuck: Duck = {
      id: gameState.current.nextDuckId++,
      x: fromLeft ? -size : canvasWidth + size,
      y: 60 + Math.random() * (canvasHeight - 180),
      vx: fromLeft ? speed : -speed,
      vy: (Math.random() - 0.5) * 1.8,
      size,
      type,
      frame: 0,
      state: 'flying',
      hitRotation: 0,
      points,
    };

    gameState.current.ducks.push(newDuck);
  };

  // Add floating score text
  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    gameState.current.floatingTexts.push({
      id: gameState.current.nextTextId++,
      text,
      x,
      y,
      color,
      alpha: 1,
    });
  };

  // Spawn feather / hit particles
  const spawnParticles = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      gameState.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1,
      });
    }
  };

  // Shoot Action (Mouse Click / Touch)
  const handleShoot = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPlaying || gameOver) return;

    if (gameState.current.ammo <= 0) {
      sounds.playPop();
      reloadAmmo();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const shootX = (clientX - rect.left) * scaleX;
    const shootY = (clientY - rect.top) * scaleY;

    // Deduct ammo & sound
    gameState.current.ammo -= 1;
    gameState.current.shots += 1;
    setAmmo(gameState.current.ammo);
    sounds.playShoot();

    // Check hit
    let hitSomething = false;
    for (const duck of gameState.current.ducks) {
      if (duck.state !== 'flying') continue;

      const dist = Math.hypot(shootX - duck.x, shootY - duck.y);
      if (dist < duck.size * 0.9) {
        hitSomething = true;
        duck.state = 'hit';
        gameState.current.hits += 1;
        gameState.current.combo += 1;
        sounds.playQuack();

        // Calculate score with combo
        const comboBonus = Math.min(gameState.current.combo * 20, 200);
        const earned = duck.points > 0 ? duck.points + comboBonus : duck.points;
        gameState.current.score = Math.max(0, gameState.current.score + earned);
        setScore(gameState.current.score);
        onScoreUpdate(gameState.current.score);
        setCombo(gameState.current.combo);

        // Particle colors
        let pColor = '#ffdc52';
        if (duck.type === 'speedy') pColor = '#53c0fc';
        if (duck.type === 'king') pColor = '#ffd700';
        if (duck.type === 'bomb') pColor = '#3a3a3a';

        spawnParticles(duck.x, duck.y, pColor, 18);
        addFloatingText(
          earned > 0 ? `+${earned}` : `${earned}`,
          duck.x,
          duck.y - 20,
          earned > 0 ? (gameState.current.combo > 2 ? '#ff4766' : '#285d88') : '#e03131'
        );

        if (duck.type === 'king') {
          // Bonus time!
          setTimeLeft((prev) => prev + 5);
          addFloatingText('+5s BONUS!', duck.x, duck.y - 45, '#ffd700');
        }

        break;
      }
    }

    if (!hitSomething) {
      gameState.current.combo = 0;
      setCombo(0);
      spawnParticles(shootX, shootY, '#ffffff', 4);
    }

    setAccuracy({
      shots: gameState.current.shots,
      hits: gameState.current.hits,
    });
  };

  // Canvas Drawing Routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Arcade Sky & Clouds
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, '#c7e5fc');
      skyGradient.addColorStop(0.65, '#e5f3fd');
      skyGradient.addColorStop(0.75, '#b0e0a8');
      skyGradient.addColorStop(1, '#6db867');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(width * 0.25, height * 0.2, 45, 0, Math.PI * 2);
      ctx.arc(width * 0.29, height * 0.18, 55, 0, Math.PI * 2);
      ctx.arc(width * 0.35, height * 0.2, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(width * 0.75, height * 0.3, 35, 0, Math.PI * 2);
      ctx.arc(width * 0.79, height * 0.28, 48, 0, Math.PI * 2);
      ctx.arc(width * 0.84, height * 0.3, 32, 0, Math.PI * 2);
      ctx.fill();

      // Grass Hills at bottom
      ctx.fillStyle = '#7ac972';
      ctx.beginPath();
      ctx.ellipse(width * 0.3, height + 10, width * 0.45, 90, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5fb357';
      ctx.beginPath();
      ctx.ellipse(width * 0.8, height + 15, width * 0.4, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bushes / Reeds
      ctx.fillStyle = '#42933b';
      for (let i = 20; i < width; i += 70) {
        ctx.beginPath();
        ctx.arc(i, height - 10, 18, 0, Math.PI, true);
        ctx.fill();
      }

      // 2. Spawn Ducks if playing
      if (gameState.current.isPlaying) {
        const now = Date.now();
        const spawnRate = Math.max(800, 1900 - Math.floor(gameState.current.score / 600) * 150);
        if (now - gameState.current.lastSpawn > spawnRate) {
          spawnDuck(width, height);
          gameState.current.lastSpawn = now;
        }
      }

      // 3. Update & Draw Ducks
      gameState.current.ducks.forEach((duck) => {
        if (duck.state === 'flying') {
          duck.x += duck.vx;
          duck.y += duck.vy;
          duck.frame += 0.18;

          // Wave vertical motion
          duck.vy += (Math.random() - 0.5) * 0.4;
          duck.vy = Math.max(-2, Math.min(2, duck.vy));

          // Boundary checks
          if (duck.y < 40) duck.vy = Math.abs(duck.vy);
          if (duck.y > height - 120) duck.vy = -Math.abs(duck.vy);
        } else if (duck.state === 'hit') {
          duck.y += 6;
          duck.hitRotation += 0.2;
        }

        // Draw Duck using Cute Vector Art
        ctx.save();
        ctx.translate(duck.x, duck.y);
        if (duck.state === 'hit') {
          ctx.rotate(duck.hitRotation);
        } else if (duck.vx < 0) {
          ctx.scale(-1, 1);
        }

        const wingFlap = Math.sin(duck.frame) * 12;

        // Duck Body
        let bodyColor = '#fcd036';
        let beakColor = '#ff8f26';
        if (duck.type === 'speedy') {
          bodyColor = '#5ec8ff';
          beakColor = '#ff5b36';
        } else if (duck.type === 'king') {
          bodyColor = '#ffd700';
          beakColor = '#ff7b1a';
        } else if (duck.type === 'bomb') {
          bodyColor = '#3f4247';
          beakColor = '#ff3344';
        }

        // Body Oval
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, duck.size * 0.5, duck.size * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2b4461';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Wing
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(-duck.size * 0.08, wingFlap, duck.size * 0.3, duck.size * 0.2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(duck.size * 0.38, -duck.size * 0.25, duck.size * 0.26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Beak
        ctx.fillStyle = beakColor;
        ctx.beginPath();
        ctx.moveTo(duck.size * 0.58, -duck.size * 0.3);
        ctx.lineTo(duck.size * 0.95, -duck.size * 0.2);
        ctx.lineTo(duck.size * 0.58, -duck.size * 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(duck.size * 0.44, -duck.size * 0.3, duck.size * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        if (duck.state === 'hit') {
          // X eye when hit
          ctx.font = '10px bold sans-serif';
          ctx.fillText('X', duck.size * 0.4, -duck.size * 0.25);
        } else {
          ctx.arc(duck.size * 0.46, -duck.size * 0.3, duck.size * 0.045, 0, Math.PI * 2);
          ctx.fill();
        }

        // King Crown
        if (duck.type === 'king') {
          ctx.fillStyle = '#ffd700';
          ctx.strokeStyle = '#b8860b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(duck.size * 0.22, -duck.size * 0.48);
          ctx.lineTo(duck.size * 0.26, -duck.size * 0.68);
          ctx.lineTo(duck.size * 0.38, -duck.size * 0.55);
          ctx.lineTo(duck.size * 0.5, -duck.size * 0.7);
          ctx.lineTo(duck.size * 0.54, -duck.size * 0.48);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Bomb Fuse
        if (duck.type === 'bomb') {
          ctx.strokeStyle = '#ffa500';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -duck.size * 0.38);
          ctx.quadraticCurveTo(duck.size * 0.1, -duck.size * 0.6, duck.size * 0.2, -duck.size * 0.55);
          ctx.stroke();
          // Spark
          ctx.fillStyle = '#ff2200';
          ctx.beginPath();
          ctx.arc(duck.size * 0.2, -duck.size * 0.55, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Filter out offscreen ducks
      gameState.current.ducks = gameState.current.ducks.filter(
        (d) => d.x > -100 && d.x < width + 100 && d.y < height + 100
      );

      // 4. Update & Draw Particles
      gameState.current.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      gameState.current.particles = gameState.current.particles.filter((p) => p.alpha > 0);

      // 5. Update & Draw Floating Texts
      gameState.current.floatingTexts.forEach((t) => {
        t.y -= 1.2;
        t.alpha -= 0.02;

        ctx.save();
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = t.color;
        ctx.globalAlpha = Math.max(0, t.alpha);
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 4;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });
      gameState.current.floatingTexts = gameState.current.floatingTexts.filter((t) => t.alpha > 0);

      // 6. Draw Crosshair on Desktop
      if (crosshairPos.x > 0 && crosshairPos.y > 0) {
        ctx.save();
        ctx.strokeStyle = '#ff4766';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(crosshairPos.x, crosshairPos.y, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(crosshairPos.x - 30, crosshairPos.y);
        ctx.lineTo(crosshairPos.x + 30, crosshairPos.y);
        ctx.moveTo(crosshairPos.x, crosshairPos.y - 30);
        ctx.lineTo(crosshairPos.x, crosshairPos.y + 30);
        ctx.stroke();

        ctx.fillStyle = '#ff4766';
        ctx.beginPath();
        ctx.arc(crosshairPos.x, crosshairPos.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [crosshairPos]);

  // Track Mouse movement for crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setCrosshairPos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  };

  const handleMouseLeave = () => {
    setCrosshairPos({ x: -100, y: -100 });
  };

  return (
    <div className="flex-1 flex flex-col gap-4 w-full">
      {/* Console Top Dashboard */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Score & Combo */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#121218] text-white shadow-xs border border-white/10">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block leading-none">Điểm Số</span>
            <span className="text-lg font-black tracking-wider leading-tight text-white">{score}</span>
          </div>

          {combo > 1 && (
            <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-extrabold text-xs shadow-xs animate-bounce">
              <span>COMBO x{combo}!</span>
            </div>
          )}
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/70 border border-white/90 shadow-xs">
          <span className="text-xs font-bold text-[#565f74]">Thời Gian:</span>
          <span className={`text-base font-black ${timeLeft <= 10 ? 'text-red-500 animate-ping' : 'text-[#121218]'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Ammo & Reload Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/60 px-3 py-2 rounded-xl border border-white/80 shadow-xs">
            <span className="text-xs font-bold text-[#565f74] mr-1">Đạn:</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-6 rounded-md transition-all duration-200 ${
                  i < ammo
                    ? 'bg-gradient-to-t from-amber-500 to-amber-300 border border-amber-600 shadow-xs'
                    : 'bg-neutral-200 border border-neutral-300 opacity-30'
                }`}
              />
            ))}
          </div>

          <button
            onClick={reloadAmmo}
            disabled={ammo === 6 || isReloading}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold tracking-wider transition-all border ${
              ammo === 0
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border-red-500 shadow-xs'
                : 'bg-white hover:bg-neutral-50 text-[#121218] border-white shadow-xs'
            }`}
          >
            {isReloading ? 'Đang Nạp...' : 'Nạp Đạn (R)'}
          </button>
        </div>
      </div>

      {/* Main Game Screen Canvas */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-white/90 shadow-xl bg-neutral-950">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          onClick={handleShoot}
          onTouchStart={handleShoot}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* Overlay when game has not started */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white select-none">
            <h2 className="text-2xl sm:text-3xl font-black mb-1.5 drop-shadow-md tracking-tight">
              DUCK HUNT ARCADE
            </h2>
            <p className="text-xs sm:text-sm text-neutral-200 max-w-md mb-6 leading-relaxed">
              Trò chơi bắn vịt cổ điển tốc độ 60 FPS. Nhắm bắn chính xác và phím R để nạp đạn nhanh.
            </p>
            <button
              onClick={startGame}
              className="dark-pill-btn px-7 py-3 rounded-xl font-bold text-sm hover:scale-102"
            >
              Bắt Đầu Lượt Chơi
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white select-none">
            <h2 className="text-2xl sm:text-3xl font-black mb-1 text-white drop-shadow">
              KẾT THÚC LƯỢT CHƠI
            </h2>
            
            <div className="grid grid-cols-2 gap-3 my-4 w-full max-w-xs">
              <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                <span className="block text-[10px] text-neutral-300 uppercase font-bold">Điểm Đạt Được</span>
                <span className="text-2xl font-black text-white">{score}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                <span className="block text-[10px] text-neutral-300 uppercase font-bold">Kỷ Lục Cao Nhất</span>
                <span className="text-2xl font-black text-amber-300">{Math.max(score, highScore)}</span>
              </div>
            </div>

            <div className="text-xs text-neutral-300 mb-6 font-medium">
              Độ chính xác: {accuracy.shots > 0 ? Math.round((accuracy.hits / accuracy.shots) * 100) : 0}% ({accuracy.hits}/{accuracy.shots} phát)
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={startGame}
                className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm border border-white/40 hover:scale-105 transition-transform"
              >
                Chơi Lại
              </button>

              <button
                onClick={() => {
                  sounds.playPop();
                  const title = score > 1500 ? 'Huyền Thoại Bắn Vịt' : score > 800 ? 'Thiện Xạ Bách Phát' : 'Thợ Săn Tập Sự';
                  onSendToPhotobooth(score, title);
                }}
                className="dark-pill-btn px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:scale-105 transition-transform"
              >
                Chụp Ảnh Cùng Kỷ Lục
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guide Note for Mobile & Laptop */}
      <div className="flex items-center justify-between text-xs text-[#5a6275] px-2 font-medium">
        <span>Laptop: Rê chuột để ngắm, Click chuột để bắn, phím R để nạp đạn</span>
        <span className="hidden sm:inline">Mobile: Chạm trực tiếp vào màn hình để bắn</span>
      </div>
    </div>
  );
};

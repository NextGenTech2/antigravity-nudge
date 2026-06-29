import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wind, Gamepad2, Trophy, ShieldCheck, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { haptics } from '../services/haptics';

const GAME_COLOR_PALETTE = [
  { name: 'Indigo', bgClass: 'bg-indigo-500', hex: '#6366F1' },
  { name: 'Rose', bgClass: 'bg-rose-500', hex: '#F43F5E' },
  { name: 'Amber', bgClass: 'bg-amber-500', hex: '#F59E0B' },
  { name: 'Emerald', bgClass: 'bg-emerald-500', hex: '#10B981' },
  { name: 'Cyan', bgClass: 'bg-cyan-500', hex: '#06B6D4' },
  { name: 'Purple', bgClass: 'bg-purple-500', hex: '#A855F7' },
  { name: 'Orange', bgClass: 'bg-orange-500', hex: '#F97316' },
  { name: 'Pink', bgClass: 'bg-pink-500', hex: '#EC4899' },
  { name: 'Slate', bgClass: 'bg-slate-500', hex: '#64748B' },
];

export const GlobalInterceptOverlay: React.FC = () => {
  const { globalIntercept, stopGlobalIntercept } = useAppStore();

  // --- BREATHING INTERVENTION STATES ---
  const [breatheTime, setBreatheTime] = useState(60);
  const [isBreatheFinished, setIsBreatheFinished] = useState(false);
  const breatheIntervalRef = useRef<any>(null);

  // Box Breathing Cycle: 16s total (4s inhale, 4s hold, 4s exhale, 4s hold)
  const getBreathingPhase = (timeLeft: number) => {
    const cycleSeconds = (60 - timeLeft) % 16;
    if (cycleSeconds < 4) {
      return { phase: 'Inhale 🌬️', desc: 'Fill your lungs slowly...', scale: 1 + (cycleSeconds / 4) * 0.5 };
    }
    if (cycleSeconds < 8) {
      return { phase: 'Hold 🧘', desc: 'Hold your breath...', scale: 1.5 };
    }
    if (cycleSeconds < 12) {
      return { phase: 'Exhale 💨', desc: 'Release the air gently...', scale: 1.5 - ((cycleSeconds - 8) / 4) * 0.5 };
    }
    return { phase: 'Hold 🧘', desc: 'Rest and hold...', scale: 1.0 };
  };

  const currentBreatheCycle = getBreathingPhase(breatheTime);

  // --- FOCUS GAME STATES ---
  const [gameTime, setGameTime] = useState(30);
  const [gameScore, setGameScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'FINISHED'>('PLAYING');
  const [targetColor, setTargetColor] = useState(GAME_COLOR_PALETTE[0]);
  const [gridColors, setGridColors] = useState<typeof GAME_COLOR_PALETTE>([]);
  const gameIntervalRef = useRef<any>(null);

  const scrambleGameGrid = (currentTarget: typeof GAME_COLOR_PALETTE[0]) => {
    const shuffled = [...GAME_COLOR_PALETTE].sort(() => Math.random() - 0.5);
    const grid = shuffled.slice(0, 9);
    if (!grid.some((c) => c.name === currentTarget.name)) {
      grid[Math.floor(Math.random() * 9)] = currentTarget;
    }
    setGridColors(grid);
  };

  // Start Interventions on mount
  useEffect(() => {
    if (globalIntercept === 'BREATHE') {
      setBreatheTime(60);
      setIsBreatheFinished(false);
      breatheIntervalRef.current = setInterval(() => {
        setBreatheTime((prev) => {
          if (prev <= 1) {
            if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
            haptics.successNotification();
            setIsBreatheFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (globalIntercept === 'GAME') {
      setGameTime(30);
      setGameScore(0);
      setGameStatus('PLAYING');
      const randomTarget = GAME_COLOR_PALETTE[Math.floor(Math.random() * GAME_COLOR_PALETTE.length)];
      setTargetColor(randomTarget);
      scrambleGameGrid(randomTarget);
      
      gameIntervalRef.current = setInterval(() => {
        setGameTime((prev) => {
          if (prev <= 1) {
            if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
            haptics.successNotification();
            setGameStatus('FINISHED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [globalIntercept]);

  const handleTileClick = (colorName: string) => {
    if (colorName === targetColor.name) {
      haptics.lightTap();
      const newScore = gameScore + 1;
      setGameScore(newScore);
      const newTarget = GAME_COLOR_PALETTE[Math.floor(Math.random() * GAME_COLOR_PALETTE.length)];
      setTargetColor(newTarget);
      scrambleGameGrid(newTarget);
    } else {
      haptics.warningNotification();
    }
  };

  const handleComplete = () => {
    haptics.successNotification();
    stopGlobalIntercept();
  };

  // Early return must be below all hook declarations
  if (globalIntercept === 'NONE') return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-darkbg flex flex-col justify-between p-6 text-center select-none">
      
      {/* 1. BREATHING INTERVENTION VIEW */}
      {globalIntercept === 'BREATHE' && (
        <div className="flex-1 flex flex-col justify-between py-6">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 text-indigo-400">
            <Wind size={20} className="animate-pulse" />
            <span className="text-sm font-black uppercase tracking-wider">Somatic Reset Active</span>
          </div>

          {!isBreatheFinished ? (
            /* Active Breathing Screen */
            <div className="flex-1 flex flex-col justify-center items-center space-y-8">
              <motion.div
                animate={{ scale: currentBreatheCycle.scale }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="h-32 w-32 rounded-full bg-indigo-500/10 border-2 border-indigo-400 flex items-center justify-center shadow-glass-glow"
              >
                <span className="text-sm font-black text-indigo-300 uppercase tracking-widest">
                  {currentBreatheCycle.phase}
                </span>
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-100">{currentBreatheCycle.desc}</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                  By regulating your breathing, you trigger the parasympathetic nervous system, suppressing impulsive cravings.
                </p>
              </div>

              {/* Timer */}
              <div className="glass-panel p-3 bg-slate-900/50 max-w-xs mx-auto w-full">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Remaining Time</p>
                <p className="text-2xl font-black text-indigo-400 font-mono">{breatheTime}s</p>
              </div>
            </div>
          ) : (
            /* Finished Breathing Screen */
            <div className="flex-1 flex flex-col justify-center items-center space-y-6">
              <div className="mx-auto h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shadow-success-glow mb-2 animate-float">
                <ShieldCheck size={32} />
              </div>
              
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-100 flex items-center justify-center gap-1.5">
                  Nervous System Calmed! <Sparkles size={18} className="text-amber-400 fill-amber-400" />
                </h2>
                <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed mx-auto">
                  Your heart rate has dropped and your prefrontal cortex is back in control.
                </p>
              </div>

              <button
                onClick={handleComplete}
                className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 px-4 rounded-xl shadow-accent-glow transition-all cursor-pointer active:scale-95 text-xs uppercase tracking-widest"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            🔒 Navigation locked until reset completes
          </div>
        </div>
      )}

      {/* 2. FOCUS GAME INTERVENTION VIEW */}
      {globalIntercept === 'GAME' && (
        <div className="flex-1 flex flex-col justify-between py-6">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 text-indigo-400">
            <Gamepad2 size={20} />
            <span className="text-sm font-black uppercase tracking-wider">Cognitive Disruption Active</span>
          </div>

          {gameStatus === 'PLAYING' ? (
            /* Active Game Screen */
            <div className="flex-1 flex flex-col justify-center items-center space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target Color</p>
                <h3 className="text-2xl font-black tracking-tight" style={{ color: targetColor.hex }}>
                  TAP THE {targetColor.name.toUpperCase()} TILE
                </h3>
              </div>

              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 gap-3.5 max-w-[220px] w-full aspect-square">
                {gridColors.map((color, idx) => (
                  <motion.button
                    key={`${color.name}-${idx}`}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleTileClick(color.name)}
                    className={`w-full h-full rounded-xl ${color.bgClass} shadow-md border border-slate-900/40 cursor-pointer`}
                  />
                ))}
              </div>

              {/* Score and Timer */}
              <div className="flex justify-around w-full max-w-xs text-center border-t border-slate-900 pt-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time Left</p>
                  <p className="text-xl font-black text-slate-200 font-mono">{gameTime}s</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score</p>
                  <p className="text-xl font-black text-emerald-400 font-mono">{gameScore}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Finished Game Screen */
            <div className="flex-1 flex flex-col justify-center items-center space-y-6">
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-full shadow-success-glow animate-bounce">
                <Trophy size={48} />
              </div>
              
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-100">Visual Loop Collapsed!</h2>
                <p className="text-xs text-slate-400">
                  You scored <strong className="text-emerald-400 font-mono text-sm">{gameScore}</strong> points.
                </p>
              </div>

              <p className="text-xs text-slate-300 max-w-[280px] leading-relaxed mx-auto">
                By engaging your visual processing centers in rapid color-matching, you successfully blocked the brain from mental-imaging food cravings.
              </p>

              <button
                onClick={handleComplete}
                className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 px-4 rounded-xl shadow-accent-glow transition-all cursor-pointer active:scale-95 text-xs uppercase tracking-widest"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            🔒 Navigation locked until game completes
          </div>
        </div>
      )}

    </div>
  );
};
export default GlobalInterceptOverlay;

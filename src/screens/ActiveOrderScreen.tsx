import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Box, UserCheck, Compass, TrendingUp, Sparkles, Wind, Gamepad2, X, Trophy } from 'lucide-react';
import type { DeliveryStageType } from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';
import { haptics } from '../services/haptics';
import nudgesData from '../data/nudges.json';

// Lazy load the MapTracker (so Leaflet is only loaded during the EN_ROUTE stage)
const MapTracker = lazy(() => import('../components/MapTracker'));

interface ActiveOrderScreenProps {
  stage: DeliveryStageType;
  stageProgress: number;       // 0 to 1 (progress of the current stage)
  eta: number;                 // overall remaining minutes
  currentSavings: number;      // continuously ticking savings counter
  restaurantName: string;
  cuisine: string;
}

// Color Grid Game Colors configuration
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

export const ActiveOrderScreen: React.FC<ActiveOrderScreenProps> = ({
  stage,
  stageProgress,
  eta,
  currentSavings,
  restaurantName,
  cuisine,
}) => {
  // Overlays State
  const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'BREATHE' | 'GAME'>('NONE');

  // Nudge Engine State
  const { settings } = useAppStore();
  const [currentNudge, setCurrentNudge] = useState<any>(null);

  useEffect(() => {
    // Determine category
    const lowerCuisine = cuisine.toLowerCase();
    const lowerName = restaurantName.toLowerCase();
    let foodCategory = 'general';

    if (lowerCuisine.includes('pizza') || lowerCuisine.includes('italian')) {
      foodCategory = 'pizza';
    } else if (lowerCuisine.includes('burger') || lowerCuisine.includes('american') || lowerName.includes('burger')) {
      foodCategory = 'burger';
    } else if (lowerCuisine.includes('biryani') || lowerCuisine.includes('indian') || lowerName.includes('biryani')) {
      foodCategory = 'biryani';
    } else if (lowerCuisine.includes('sushi') || lowerCuisine.includes('japanese') || lowerName.includes('sushi')) {
      foodCategory = 'sushi';
    } else if (lowerCuisine.includes('salad') || lowerCuisine.includes('healthy')) {
      foodCategory = 'salad';
    }

    // Filter nudges
    const categoryNudges = nudgesData.filter((n: any) => n.category === foodCategory);
    const generalNudges = nudgesData.filter((n: any) => n.category === 'general');
    const availableNudges = [...categoryNudges, ...generalNudges];

    if (availableNudges.length === 0) return;

    // Helper to get next nudge (alternating types and preventing sequential repeats)
    const getNextNudge = (lastNudgeId: string | null, lastNudgeType: string | null) => {
      const targetType = lastNudgeType === 'physiological' ? 'financial' : 'physiological';
      let pool = availableNudges.filter((n: any) => n.type === targetType && n.id !== lastNudgeId);

      // Fallback if pool is empty
      if (pool.length === 0) {
        pool = availableNudges.filter((n: any) => n.id !== lastNudgeId);
      }
      if (pool.length === 0) {
        pool = availableNudges;
      }

      return pool[Math.floor(Math.random() * pool.length)];
    };

    // Initial nudge
    const firstNudge = availableNudges[Math.floor(Math.random() * availableNudges.length)];
    setCurrentNudge(firstNudge);

    // Rotation interval
    const intervalDuration = settings.fastModeEnabled ? 3000 : 180000; // 3s vs 3m
    let currentId = firstNudge?.id || null;
    let currentType = firstNudge?.type || null;

    const interval = setInterval(() => {
      const nextNudge = getNextNudge(currentId, currentType);
      if (nextNudge) {
        setCurrentNudge(nextNudge);
        currentId = nextNudge.id;
        currentType = nextNudge.type;
      }
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [cuisine, restaurantName, settings.fastModeEnabled]);

  // Goal Carousel State
  const [goalIndex, setGoalIndex] = useState(0);

  // Geolocation Integration
  const [userCoords, setUserCoords] = useState<[number, number]>([12.9856, 77.6056]);
  const [restaurantCoords, setRestaurantCoords] = useState<[number, number]>([12.9716, 77.5946]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords([latitude, longitude]);
        // Path Calibration: Place restaurant ~1.5km away (0.012 lat, 0.008 lng offset)
        setRestaurantCoords([latitude - 0.012, longitude + 0.008]);
      },
      (error) => {
        console.log('Geolocation access denied or failed. Using fallback city coordinates.', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);
  const GOALS = [
    `₹${currentSavings} saved = 12% toward your weekend getaway trip ✈️`,
    `₹${currentSavings} saved = 25% toward a premium mechanical keyboard ⌨️`,
    `₹${currentSavings} saved = 10% toward your gym membership 🏋️`,
    `₹${currentSavings} saved = 8% toward a new pair of running shoes 👟`,
  ];

  // 1. Goal Carousel Timer
  useEffect(() => {
    if (stage !== 'EN_ROUTE') return;
    const interval = setInterval(() => {
      setGoalIndex((prev) => (prev + 1) % GOALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [stage, GOALS.length]);

  // 2. Breathing Module States
  const [breatheTime, setBreatheTime] = useState(60);
  const breatheIntervalRef = useRef<any>(null);

  // Box Breathing Cycle: 16s total (4s inhale, 4s hold, 4s exhale, 4s hold)
  const getBreathingPhase = (timeLeft: number) => {
    const cycleSeconds = (60 - timeLeft) % 16;
    if (cycleSeconds < 4) {
      return { phase: 'Inhale', desc: 'Fill your lungs slowly...', scale: 1 + (cycleSeconds / 4) * 0.5 };
    }
    if (cycleSeconds < 8) {
      return { phase: 'Hold', desc: 'Hold your breath...', scale: 1.5 };
    }
    if (cycleSeconds < 12) {
      return { phase: 'Exhale', desc: 'Release the air gently...', scale: 1.5 - ((cycleSeconds - 8) / 4) * 0.5 };
    }
    return { phase: 'Hold', desc: 'Rest and hold...', scale: 1.0 };
  };

  const currentBreatheCycle = getBreathingPhase(breatheTime);

  const startBreathing = () => {
    haptics.lightTap();
    setBreatheTime(60);
    setActiveOverlay('BREATHE');
    breatheIntervalRef.current = setInterval(() => {
      setBreatheTime((prev) => {
        if (prev <= 1) {
          if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
          haptics.successNotification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopBreathing = () => {
    haptics.lightTap();
    if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
    setActiveOverlay('NONE');
  };

  // 3. Distraction Grid Game States
  const [gameTime, setGameTime] = useState(30);
  const [gameScore, setGameScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'FINISHED'>('PLAYING');
  const [targetColor, setTargetColor] = useState(GAME_COLOR_PALETTE[0]);
  const [gridColors, setGridColors] = useState<typeof GAME_COLOR_PALETTE>([]);
  const gameIntervalRef = useRef<any>(null);

  const scrambleGameGrid = (currentTarget: typeof GAME_COLOR_PALETTE[0]) => {
    // Shuffled palette
    const shuffled = [...GAME_COLOR_PALETTE].sort(() => Math.random() - 0.5);
    // Ensure target color is included in the 9 grid elements
    const grid = shuffled.slice(0, 9);
    if (!grid.some((c) => c.name === currentTarget.name)) {
      grid[Math.floor(Math.random() * 9)] = currentTarget;
    }
    setGridColors(grid);
  };

  const startGame = () => {
    haptics.lightTap();
    setGameTime(30);
    setGameScore(0);
    setGameStatus('PLAYING');
    const randomTarget = GAME_COLOR_PALETTE[Math.floor(Math.random() * GAME_COLOR_PALETTE.length)];
    setTargetColor(randomTarget);
    scrambleGameGrid(randomTarget);
    setActiveOverlay('GAME');

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
  };

  const handleTileClick = (colorName: string) => {
    if (colorName === targetColor.name) {
      haptics.lightTap();
      const newScore = gameScore + 1;
      setGameScore(newScore);
      // Select new target
      const newTarget = GAME_COLOR_PALETTE[Math.floor(Math.random() * GAME_COLOR_PALETTE.length)];
      setTargetColor(newTarget);
      scrambleGameGrid(newTarget);
    } else {
      haptics.warningNotification();
    }
  };

  const stopGame = () => {
    haptics.lightTap();
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    setActiveOverlay('NONE');
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);

  // Dynamic cooking messages based on cuisine
  const getPreparingMessage = () => {
    const LowerCuisine = cuisine.toLowerCase();
    const LowerName = restaurantName.toLowerCase();

    if (LowerCuisine.includes('pizza') || LowerCuisine.includes('italian')) {
      return {
        text: 'Baking the crust in our wood-fired oven and melting the fresh mozzarella...',
        emoji: '🍕',
      };
    }
    if (LowerCuisine.includes('burger') || LowerCuisine.includes('american') || LowerName.includes('burger')) {
      return {
        text: 'Grilling the gourmet smash patties to perfection and caramelizing the onions...',
        emoji: '🍔',
      };
    }
    if (LowerCuisine.includes('sushi') || LowerCuisine.includes('japanese') || LowerName.includes('sushi')) {
      return {
        text: 'Slicing the fresh Norwegian salmon and rolling the maki with precision...',
        emoji: '🍣',
      };
    }
    if (LowerCuisine.includes('salad') || LowerCuisine.includes('healthy')) {
      return {
        text: 'Tossing the organic quinoa, slicing fresh avocados, and rinsing organic greens...',
        emoji: '🥗',
      };
    }
    if (LowerCuisine.includes('biryani') || LowerCuisine.includes('indian') || LowerName.includes('biryani')) {
      return {
        text: 'Steaming the fragrant basmati rice dum-style in the clay pot with saffron...',
        emoji: '🍛',
      };
    }

    return {
      text: 'Chef is handcrafting your gourmet meal with fresh ingredients...',
      emoji: '🧑‍🍳',
    };
  };

  const prep = getPreparingMessage();

  // Stage configuration
  const STAGE_DETAILS = {
    IDLE: { 
      title: 'No active craving', 
      icon: ChefHat, 
      desc: '', 
      emoji: '', 
      color: '', 
      bgColor: '', 
      borderColor: '' 
    },
    PREPARING: {
      title: 'Preparing Your Meal',
      icon: ChefHat,
      desc: prep.text,
      emoji: prep.emoji,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/20'
    },
    PACKING: {
      title: 'Packaging Your Order',
      icon: Box,
      desc: 'Double-checking the order details and carefully sealing the thermal delivery bag...',
      emoji: '🥡',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/15',
      borderColor: 'border-indigo-500/20'
    },
    RIDER_ASSIGNED: {
      title: 'Rider Arrived at Restaurant',
      icon: UserCheck,
      desc: 'Rider has arrived at the restaurant and is waiting to pick up your contactless delivery...',
      emoji: '🚴',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/15',
      borderColor: 'border-cyan-500/20'
    },
    EN_ROUTE: {
      title: 'Rider is En Route',
      icon: Compass,
      desc: 'Resisting temptation. Diverting funds to your savings vault...',
      emoji: '⚡',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/20'
    },
    DELIVERED: {
      title: 'Craving Conquered!',
      icon: Sparkles,
      desc: 'Order delivered successfully. Your wallet and health thank you!',
      emoji: '🎉',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/20'
    }
  };

  const activeStage = STAGE_DETAILS[stage] || STAGE_DETAILS.PREPARING;

  return (
    <motion.div
      layoutId="activeOrderContainer"
      className="w-full h-full flex flex-col bg-darkbg overflow-y-auto"
    >
      
      {/* Top Fixed Header: Continuous Savings Spotlight */}
      <div className="p-6 pb-2 pt-8 shrink-0 bg-darkbg z-20">
        <div className="glass-panel rounded-2xl p-4 bg-gradient-to-r from-darkcard to-indigo-950/20 border-indigo-500/10 shadow-glass-glow flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-success-glow">
              <TrendingUp size={18} className="animate-float" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Saved Money Ticking</p>
              <h2 className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                ₹{currentSavings}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Time Remaining</p>
              <p className="text-sm font-bold text-slate-200">{eta > 0 ? `${eta} mins` : 'Arrived'}</p>
            </div>
            <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-glass-glow flex items-center justify-center h-9 w-9">
              <span className="text-base inline-block animate-bounce">🛵</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stage Panel */}
      <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-6 relative">
        {stage === 'EN_ROUTE' ? (
          /* Map Stage with Intervention HUD Overlay */
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800/80 relative shadow-glass bg-slate-950">
            
            {/* The Map Tracker */}
            <Suspense
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center bg-darkbg">
                  <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-xs text-slate-400 font-medium">Initializing GPS Map...</p>
                </div>
              }
            >
              <MapTracker
                progress={stageProgress}
                eta={eta}
                currentSavings={currentSavings}
                userCoords={userCoords}
                restaurantCoords={restaurantCoords}
              />
            </Suspense>

            {/* Geolocation Privacy Notice */}
            <div className="absolute bottom-14 right-3 z-[9999] pointer-events-none">
              <span className="bg-slate-950/70 border border-slate-800/50 text-[7px] font-medium text-slate-500 py-0.5 px-2 rounded-full backdrop-blur-sm inline-block leading-none tracking-wider">
                📍 Simulation only · Not stored
              </span>
            </div>

            {/* HUD Sidebar: Intervention Action Icons (Floating Right) */}
            <div className="absolute right-4 top-[35%] -translate-y-1/2 flex flex-col gap-3.5 z-[9999]">
              <button
                onClick={startBreathing}
                className="h-11 w-11 rounded-full glass-panel flex items-center justify-center bg-darkcard/80 border-indigo-500/30 text-indigo-400 shadow-glass hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Breathe Exercise"
              >
                <Wind size={20} className="animate-pulse" />
              </button>
              
              <button
                onClick={startGame}
                className="h-11 w-11 rounded-full glass-panel flex items-center justify-center bg-darkcard/80 border-indigo-500/30 text-indigo-400 shadow-glass hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Focus Challenge"
              >
                <Gamepad2 size={20} />
              </button>
            </div>

            {/* Goal Carousel Banner (Floating Bottom Center on Map) */}
            <div className="absolute bottom-4 left-4 right-4 z-[9999] pointer-events-none">
              <div className="glass-panel rounded-xl py-2.5 px-4 bg-darkcard/90 border-slate-800 shadow-lg text-center max-w-sm mx-auto">
                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">Your Financial Reframing</p>
                <div className="h-4 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={goalIndex}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="text-xs text-slate-100 font-bold truncate absolute inset-0 flex items-center justify-center"
                    >
                      {GOALS[goalIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* INTERVENTION 1: Breathing Exercise Overlay */}
            <AnimatePresence>
              {activeOverlay === 'BREATHE' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-darkbg/95 backdrop-blur-md z-[9999] flex flex-col justify-between p-6 text-center"
                >
                  {/* Close Header */}
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Wind size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Mindful Breathing</span>
                    </div>
                    <button
                      onClick={stopBreathing}
                      className="p-1.5 bg-slate-900/80 rounded-full border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Breathing Pulse Graphic */}
                  <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                    <motion.div
                      animate={{ scale: currentBreatheCycle.scale }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                      className="h-20 w-20 rounded-full bg-indigo-500/10 border-2 border-indigo-400 flex items-center justify-center shadow-glass-glow"
                    >
                      <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">
                        {currentBreatheCycle.phase}
                      </span>
                    </motion.div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-200">{currentBreatheCycle.desc}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                        Box breathing calms the nervous system and dampens dopamine impulses.
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="glass-panel p-2.5 bg-slate-900/50 max-w-xs mx-auto w-full">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Remaining Time</p>
                    <p className="text-lg font-black text-indigo-400 font-mono">{breatheTime}s</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INTERVENTION 2: Distraction Grid Game Overlay */}
            <AnimatePresence>
              {activeOverlay === 'GAME' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-darkbg/95 backdrop-blur-md z-[9999] flex flex-col justify-between p-6 text-center"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Gamepad2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Focus Challenge</span>
                    </div>
                    <button
                      onClick={stopGame}
                      className="p-1.5 bg-slate-900/80 rounded-full border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {gameStatus === 'PLAYING' ? (
                    /* The Game Screen */
                    <div className="flex-1 flex flex-col justify-center items-center space-y-3">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target Color</p>
                        <h3 className="text-xl font-black tracking-tight" style={{ color: targetColor.hex }}>
                          TAP THE {targetColor.name.toUpperCase()} TILE
                        </h3>
                      </div>

                      {/* 3x3 Grid */}
                      <div className="grid grid-cols-3 gap-2 max-w-[180px] w-full aspect-square">
                        {gridColors.map((color, idx) => (
                          <motion.button
                            key={`${color.name}-${idx}`}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTileClick(color.name)}
                            className={`w-full h-full rounded-lg ${color.bgClass} shadow-md border border-slate-900/30 cursor-pointer`}
                          />
                        ))}
                      </div>

                      {/* Score and Timer */}
                      <div className="flex justify-around w-full max-w-xs text-center">
                        <div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">Time Left</p>
                          <p className="text-sm font-bold text-slate-200 font-mono">{gameTime}s</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">Score</p>
                          <p className="text-sm font-bold text-emerald-400 font-mono">{gameScore}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Game Finished Screen */
                    <div className="flex-1 flex flex-col justify-center items-center space-y-6">
                      <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-full shadow-success-glow">
                        <Trophy size={48} className="animate-bounce" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-black text-slate-100">Focus Challenge Complete!</h3>
                        <p className="text-xs text-slate-400">You scored <strong className="text-emerald-400 font-mono text-sm">{gameScore}</strong> points</p>
                      </div>

                      <p className="text-xs text-slate-300 max-w-[260px] leading-relaxed">
                        By focusing on rapid color-matching, you successfully blocked the visual cortex from imagining food cravings. Outstanding job!
                      </p>

                      <button
                        onClick={stopGame}
                        className="px-6 py-2 bg-indigo-600 border border-indigo-500 text-xs font-bold text-white rounded-full shadow-glass-glow hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
                      >
                        Return to Map
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-slate-400">
                    Engaging the visual cortex blocks the mental imagery required to maintain cravings.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ) : (
          /* Cooking/Packing/Rider Assigned Stages */
          <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
            
            {/* Pulsing Emoji Graphic */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                rotate: stage === 'PREPARING' ? [0, 10, -10, 0] : 0
              }}
              transition={{
                duration: stage === 'PREPARING' ? 3 : 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`h-28 w-28 rounded-full flex items-center justify-center text-5xl border ${activeStage.bgColor} ${activeStage.borderColor} shadow-glass`}
            >
              <span>{activeStage.emoji}</span>
            </motion.div>

            {/* Stage Title & Description */}
            <div className="space-y-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${activeStage.color}`}>
                {activeStage.title}
              </span>
              <h3 className="text-xl font-black text-slate-100 px-2 leading-snug">
                {restaurantName}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed px-4 h-12 flex items-center justify-center">
                {activeStage.desc}
              </p>
            </div>

            {/* Stage Progress Bar */}
            <div className="w-full px-6 space-y-1">
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                  style={{ width: `${stageProgress * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                <span>Cooking</span>
                <span>Ready</span>
              </div>
            </div>

            {/* Cognitive Behavioral Tips (Nudge Engine) */}
            <div className="glass-panel rounded-xl p-4 bg-darkcard/30 border-slate-900 text-xs text-slate-400 max-w-[280px] w-full min-h-[96px] flex flex-col justify-center overflow-hidden relative">
              <p className="font-bold text-indigo-400 mb-1.5 uppercase tracking-wider text-[9px] flex items-center gap-1 shrink-0">
                <span>🧠</span> Why the wait?
              </p>
              <div className="flex-1 relative flex items-center min-h-[48px]">
                <AnimatePresence mode="wait">
                  {currentNudge && (
                    <motion.p
                      key={currentNudge.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="text-xs text-slate-200 leading-relaxed text-left"
                    >
                      {currentNudge.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stage Pipeline Status Indicator */}
      <div className="glass-panel border-t border-slate-900 p-5 rounded-t-3xl shadow-glass bg-darkcard/95 pb-20 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Timeline</span>
          <span className="text-xs font-bold text-indigo-400">{activeStage.title}</span>
        </div>

        {/* Timeline dots and lines */}
        <div className="flex items-center justify-between px-2 relative">
          <div className="absolute left-4 right-4 h-0.5 bg-slate-850 top-1/2 -translate-y-1/2 -z-10" />
          
          {(['PREPARING', 'PACKING', 'RIDER_ASSIGNED', 'EN_ROUTE'] as DeliveryStageType[]).map((s, idx) => {
            const stagesOrder = ['PREPARING', 'PACKING', 'RIDER_ASSIGNED', 'EN_ROUTE'];
            const currentIdx = stagesOrder.indexOf(stage);
            const isCompleted = stagesOrder.indexOf(s) < currentIdx;
            const isActive = stage === s;

            return (
              <div key={s} className="flex flex-col items-center gap-1.5 relative">
                <div
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-success-glow'
                      : isActive
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-glass-glow scale-110'
                      : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${
                  isActive ? 'text-indigo-400 font-black' : isCompleted ? 'text-emerald-500' : 'text-slate-500'
                }`}>
                  {s.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
export default ActiveOrderScreen;

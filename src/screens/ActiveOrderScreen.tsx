import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Box, UserCheck, Compass, TrendingUp, Sparkles, Wind, Gamepad2, X, Trophy, CheckCircle2, Target, Navigation } from 'lucide-react';
import type { DeliveryStageType, CravingLog } from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../services/currency';
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

const TRIGGER_TAGS = [
  { label: 'Stress 😰', value: 'Stress' as const },
  { label: 'Boredom 🥱', value: 'Boredom' as const },
  { label: 'Ad Trigger 📺', value: 'Habit' as const },
  { label: 'Tiredness 🌙', value: 'Tiredness' as const },
  { label: 'Social 👥', value: 'Social' as const },
];

export const ActiveOrderScreen: React.FC<ActiveOrderScreenProps> = ({
  stage,
  stageProgress,
  eta,
  currentSavings,
  restaurantName,
  cuisine,
}) => {
  const { 
    activeOrder, 
    setActiveOrderTrigger, 
    goals, 
    activeGoalId, 
    setActiveGoalId,
    settings
  } = useAppStore();

  // Overlays State
  const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'BREATHE' | 'GAME'>('NONE');
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);

  // 1. Swipeable Nudges Carousel State
  const [carouselNudges, setCarouselNudges] = useState<any[]>([]);
  const [nudgeIndex, setNudgeIndex] = useState(0);

  useEffect(() => {
    if (!activeOrder) return;
    
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
    
    // Select 3 distinct cards
    const card0 = categoryNudges.length > 0 ? categoryNudges[0] : generalNudges[0];
    const card1 = nudgesData.find((n: any) => n.type === 'financial' && n.id !== card0.id) || generalNudges[1];
    const card2 = nudgesData.find((n: any) => n.type === 'physiological' && n.id !== card0.id && n.id !== card1.id) || generalNudges[2];
    
    setCarouselNudges([
      card0,
      {
        ...card1,
        text: `If you invest the ₹${activeOrder.totalSaved} saved from this meal in an index fund, it will grow to approx. ₹${Math.round(activeOrder.totalSaved * 5.7)} in 15 years at 12% CAGR. 📈`
      },
      card2
    ]);
  }, [cuisine, restaurantName, activeOrder]);

  // 2. Micro-Commitment Hold State
  const [holdProgress, setHoldProgress] = useState(0);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [recenterCount, setRecenterCount] = useState(0);
  const holdIntervalRef = useRef<any>(null);

  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    if (isAcknowledged) return;
    haptics.lightTap();
    
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current);
          haptics.successNotification();
          setIsAcknowledged(true);
          return 100;
        }
        haptics.lightTap();
        return prev + 5; // 1.5 seconds total
      });
    }, 75);
  };

  const handleHoldEnd = () => {
    if (isAcknowledged) return;
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    setHoldProgress(0);
  };

  // Reset acknowledgment when card changes
  useEffect(() => {
    setIsAcknowledged(false);
    setHoldProgress(0);
  }, [nudgeIndex]);

  // 3. Somatic Syncing (Box Breathing Progress Bar)
  const [breathCycleTime, setBreathCycleTime] = useState(0);

  useEffect(() => {
    if (stage === 'EN_ROUTE' || stage === 'IDLE' || stage === 'DELIVERED') return;
    
    const interval = setInterval(() => {
      setBreathCycleTime((prev) => (prev + 1) % 14); // 14-second cycle
    }, 1000);
    
    return () => clearInterval(interval);
  }, [stage]);

  const getProgressBarBreathingState = () => {
    if (breathCycleTime < 4) {
      return {
        phase: 'Inhale 🌬️',
        desc: 'Breathe in slowly...',
        widthPercent: 30 + (breathCycleTime / 4) * 70, // 30% to 100%
        glow: true,
      };
    }
    if (breathCycleTime < 8) {
      return {
        phase: 'Hold 🧘',
        desc: 'Hold your breath...',
        widthPercent: 100,
        glow: true,
      };
    }
    return {
      phase: 'Exhale 💨',
      desc: 'Exhale completely...',
      widthPercent: 100 - ((breathCycleTime - 8) / 6) * 70, // 100% to 30%
      glow: false,
    };
  };

  const pbBreath = getProgressBarBreathingState();

  // 4. Geolocation Integration
  const getDefaultCoords = (): { user: [number, number]; rest: [number, number] } => {
    if (settings.customCoords) {
      return { 
        user: settings.customCoords, 
        rest: [settings.customCoords[0] - 0.012, settings.customCoords[1] + 0.008] 
      };
    }
    
    // Check fallback locations matching currency
    if (settings.currency === 'USD') {
      return { user: [40.7128, -74.0060], rest: [40.7008, -73.9980] };
    }
    if (settings.currency === 'GBP') {
      return { user: [51.5074, -0.1278], rest: [51.4954, -0.1198] };
    }
    return { user: [12.9716, 77.5946], rest: [12.9856, 77.6056] };
  };

  const defaults = getDefaultCoords();
  const [userCoords, setUserCoords] = useState<[number, number]>(defaults.user);
  const [restaurantCoords, setRestaurantCoords] = useState<[number, number]>(defaults.rest);

  useEffect(() => {
    if (settings.customCoords) {
      setUserCoords(settings.customCoords);
      setRestaurantCoords([settings.customCoords[0] - 0.012, settings.customCoords[1] + 0.008]);
      return;
    }

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords([latitude, longitude]);
        setRestaurantCoords([latitude - 0.012, longitude + 0.008]);
      },
      (error) => {
        console.log('Geolocation access denied or failed. Using fallback coordinates.', error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [settings.customCoords]);

  // Goal Progress Calculation
  const activeGoal = goals.find((g) => g.id === activeGoalId) || goals[0];
  const totalWithCurrent = activeGoal.saved + (activeOrder?.totalSaved || 0);
  const goalProgressPercent = Math.min(100, Math.round((totalWithCurrent / activeGoal.target) * 100));

  // 5. Breathing Overlay States (Full Screen)
  const [breatheTime, setBreatheTime] = useState(60);
  const breatheIntervalRef = useRef<any>(null);

  const getFullBreathingPhase = (timeLeft: number) => {
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

  const currentBreatheCycle = getFullBreathingPhase(breatheTime);

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

  // 6. Distraction Grid Game States
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

  useEffect(() => {
    return () => {
      if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);

  // Dynamic cooking messages
  const getPreparingMessage = () => {
    const LowerCuisine = cuisine.toLowerCase();
    const LowerName = restaurantName.toLowerCase();

    if (LowerCuisine.includes('pizza') || LowerCuisine.includes('italian')) {
      return { text: 'Baking the crust in our wood-fired oven and melting the fresh mozzarella...', emoji: '🍕' };
    }
    if (LowerCuisine.includes('burger') || LowerCuisine.includes('american') || LowerName.includes('burger')) {
      return { text: 'Grilling the gourmet smash patties to perfection and caramelizing the onions...', emoji: '🍔' };
    }
    if (LowerCuisine.includes('sushi') || LowerCuisine.includes('japanese') || LowerName.includes('sushi')) {
      return { text: 'Slicing the fresh Norwegian salmon and rolling the maki with precision...', emoji: '🍣' };
    }
    if (LowerCuisine.includes('salad') || LowerCuisine.includes('healthy')) {
      return { text: 'Tossing the organic quinoa, slicing fresh avocados, and rinsing organic greens...', emoji: '🥗' };
    }
    if (LowerCuisine.includes('biryani') || LowerCuisine.includes('indian') || LowerName.includes('biryani')) {
      return { text: 'Steaming the fragrant basmati rice dum-style in the clay pot with saffron...', emoji: '🍛' };
    }
    if (LowerCuisine.includes('dessert') || LowerCuisine.includes('bakery')) {
      return { text: 'Baking the fudge brownies and scooping the creamy vanilla ice cream...', emoji: '🍰' };
    }
    if (LowerCuisine.includes('snack') || LowerCuisine.includes('munchies')) {
      return { text: 'Simmering the masala Maggi and popping the hot buttered corn...', emoji: '🍿' };
    }
    return { text: 'Chef is handcrafting your gourmet meal with fresh ingredients...', emoji: '🧑‍🍳' };
  };

  const prep = getPreparingMessage();

  const STAGE_DETAILS = {
    IDLE: { title: 'No active craving', icon: ChefHat, desc: '', emoji: '', color: '', bgColor: '', borderColor: '' },
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

  // Touch Swipe Handlers for Carousel
  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setNudgeIndex((prev) => Math.min(2, prev + 1));
      haptics.lightTap();
    } else if (info.offset.x > swipeThreshold) {
      setNudgeIndex((prev) => Math.max(0, prev - 1));
      haptics.lightTap();
    }
  };

  const handleTriggerSelect = (triggerVal: CravingLog['trigger']) => {
    haptics.mediumTap();
    setActiveOrderTrigger(triggerVal);
  };

  return (
    <motion.div
      layoutId="activeOrderContainer"
      className="w-full h-full flex flex-col bg-darkbg overflow-y-auto relative"
    >
      
      {/* Top Clickable Header: Continuous Savings Spotlight & Goal Progress */}
      <div className="p-6 pb-2 pt-8 shrink-0 bg-darkbg z-20">
        <div 
          onClick={() => { haptics.lightTap(); setIsAllocationOpen(true); }}
          className="glass-panel rounded-2xl p-4 bg-gradient-to-r from-darkcard to-indigo-950/20 border-indigo-500/10 shadow-glass-glow flex flex-col gap-3 cursor-pointer hover:border-indigo-500/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-success-glow">
                <TrendingUp size={18} className="animate-float" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Saved Money Ticking</p>
                <h2 className="text-2xl font-black text-emerald-400 font-mono tracking-tight flex items-center gap-1.5">
                  {formatCurrency(currentSavings, settings.currency)}
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

          {/* Inline Goal Milestone Progress */}
          <div className="border-t border-slate-900 pt-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
              <Target size={12} />
              <span>{activeGoal.emoji} {activeGoal.name}</span>
            </div>
            <div className="flex-1 max-w-[120px] h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${goalProgressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-black font-mono text-emerald-400">{goalProgressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Stage Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 py-8 relative min-h-min">
        {stage === 'EN_ROUTE' ? (
          /* Map Stage with Intervention HUD Overlay */
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800/80 relative shadow-glass bg-slate-950">
            
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
                recenterTrigger={recenterCount}
              />
            </Suspense>

            {/* Geolocation Privacy Notice */}
            <div className="absolute bottom-14 right-3 z-[9999] pointer-events-none">
              <span className="bg-slate-950/70 border border-slate-800/50 text-[7px] font-medium text-slate-500 py-0.5 px-2 rounded-full backdrop-blur-sm inline-block leading-none tracking-wider">
                📍 Simulation only · Not stored
              </span>
            </div>

            {/* HUD Sidebar: Intervention Action & Map Control Icons */}
            <div className="absolute right-4 top-[35%] -translate-y-1/2 flex flex-col gap-3.5 z-[9999]">
              <button
                onClick={() => {
                  haptics.lightTap();
                  setRecenterCount((prev) => prev + 1);
                }}
                className="h-11 w-11 rounded-full glass-panel flex items-center justify-center bg-darkcard/80 border-indigo-500/30 text-indigo-400 shadow-glass hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Re-center Map Route"
              >
                <Navigation size={20} />
              </button>

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

            {/* Goal Progress Banner (Map Stage) */}
            <div className="absolute bottom-4 left-4 right-4 z-[9999] pointer-events-none">
              <div className="glass-panel rounded-xl py-2.5 px-4 bg-darkcard/95 border-slate-800 shadow-lg text-center max-w-sm mx-auto">
                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">Your Financial Reframing</p>
                <p className="text-xs text-slate-100 font-bold truncate">
                  {formatCurrency(activeOrder?.totalSaved || 0, settings.currency)} saved = {goalProgressPercent}% toward your {activeGoal.name} {activeGoal.emoji}
                </p>
              </div>
            </div>

            {/* Breathing Overlay (Full Screen) */}
            <AnimatePresence>
              {activeOverlay === 'BREATHE' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-darkbg/95 backdrop-blur-md z-[9999] flex flex-col justify-between p-6 text-center"
                >
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

                  <div className="glass-panel p-2.5 bg-slate-900/50 max-w-xs mx-auto w-full">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Remaining Time</p>
                    <p className="text-lg font-black text-indigo-400 font-mono">{breatheTime}s</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Focus Game Overlay (Full Screen) */}
            <AnimatePresence>
              {activeOverlay === 'GAME' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-darkbg/95 backdrop-blur-md z-[9999] flex flex-col justify-between p-6 text-center"
                >
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
                    <div className="flex-1 flex flex-col justify-center items-center space-y-3">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target Color</p>
                        <h3 className="text-xl font-black tracking-tight" style={{ color: targetColor.hex }}>
                          TAP THE {targetColor.name.toUpperCase()} TILE
                        </h3>
                      </div>

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
                scale: [1, 1.06, 1],
                rotate: stage === 'PREPARING' ? [0, 5, -5, 0] : 0
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`h-24 w-24 rounded-full flex items-center justify-center text-4xl border ${activeStage.bgColor} ${activeStage.borderColor} shadow-glass`}
            >
              <span>{activeStage.emoji}</span>
            </motion.div>

            {/* Craving Dissection (Micro-Journaling Trigger Tags) */}
            <div className="w-full max-w-[330px] space-y-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                What triggered this craving?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {TRIGGER_TAGS.map((tag) => {
                  const isActive = activeOrder?.trigger === tag.value;
                  return (
                    <button
                      key={tag.value}
                      onClick={() => handleTriggerSelect(tag.value)}
                      className={`py-1.5 px-3.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-glass-glow'
                          : 'bg-darkcard/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage Title & Description */}
            <div className="space-y-1">
              <span className={`text-xs font-black uppercase tracking-widest ${activeStage.color}`}>
                {activeStage.title}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed px-4 h-10 flex items-center justify-center">
                {activeStage.desc}
              </p>
            </div>

            {/* Somatic Breathing Progress Bar */}
            <div className="w-full px-6 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <span>{stage === 'PREPARING' ? 'Cooking' : stage === 'PACKING' ? 'Packing' : 'Rider Waiting'} ({Math.round(stageProgress * 100)}%)</span>
                <span className="text-indigo-400 animate-pulse font-black">{pbBreath.phase}</span>
              </div>
              
              <div className="w-full h-7 bg-slate-950/80 border border-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                {/* Background overall cooking progress */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-indigo-950/45 transition-all duration-500"
                  style={{ width: `${stageProgress * 100}%` }}
                />
                
                {/* Foreground breathing pulse bar */}
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/35 transition-all duration-1000 ease-in-out ${
                    pbBreath.glow ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''
                  }`}
                  style={{ width: `${pbBreath.widthPercent}%` }}
                />
                
                {/* Breathing Guidance Text */}
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-200 relative z-10 drop-shadow-md">
                  {pbBreath.desc}
                </span>
              </div>
            </div>

            {/* Swipeable Cognitive Reframing Cards */}
            <div className="w-full max-w-[330px] flex flex-col items-center">
              <div className="w-full overflow-hidden relative min-h-[170px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {carouselNudges.length > 0 && (
                    <motion.div
                      key={nudgeIndex}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={handleDragEnd}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="glass-panel rounded-xl p-5 bg-darkcard/30 border-slate-900 text-slate-400 w-full flex flex-col justify-between min-h-[160px] cursor-grab active:cursor-grabbing select-none"
                    >
                      <div>
                        <p className="font-black text-indigo-400 mb-2.5 uppercase tracking-wider text-[10px] flex items-center justify-between shrink-0">
                          <span>🧠 COGNITIVE REFRAMING</span>
                          <span className="text-slate-500 font-mono text-[9px]">{nudgeIndex + 1}/3</span>
                        </p>
                        <p className="text-xs text-slate-100 leading-relaxed text-left font-medium">
                          {carouselNudges[nudgeIndex]?.text}
                        </p>
                      </div>

                      {/* Micro-Commitment Hold Button */}
                      <div className="mt-4 pt-3 border-t border-slate-800/40 w-full">
                        <button
                          onMouseDown={handleHoldStart}
                          onMouseUp={handleHoldEnd}
                          onMouseLeave={handleHoldEnd}
                          onTouchStart={handleHoldStart}
                          onTouchEnd={handleHoldEnd}
                          className={`w-full h-8 rounded-lg text-[10px] font-black uppercase tracking-widest relative overflow-hidden transition-all duration-300 cursor-pointer ${
                            isAcknowledged 
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20'
                          }`}
                        >
                          {/* Loading background */}
                          {!isAcknowledged && (
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-indigo-500/25 transition-all duration-75"
                              style={{ width: `${holdProgress}%` }}
                            />
                          )}
                          <span className="relative z-10 flex items-center justify-center gap-1">
                            {isAcknowledged ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-400" />
                                <span>Reframed & Acknowledged</span>
                              </>
                            ) : (
                              <span>Hold to Acknowledge ({Math.round(holdProgress)}%)</span>
                            )}
                          </span>
                        </button>
                        {isAcknowledged && (
                          <motion.p 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[9px] font-bold text-emerald-500 mt-1.5 text-center"
                          >
                            Prefrontal cortex engaged. You are in control.
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Carousel Page Dots */}
              <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map((idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      nudgeIndex === idx ? 'w-4 bg-indigo-500' : 'w-1.5 bg-slate-800'
                    }`}
                  />
                ))}
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

      {/* Goal Allocation "Fund It" Bottom Drawer Modal */}
      <AnimatePresence>
        {isAllocationOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAllocationOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[99998]"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 glass-panel bg-darkcard rounded-t-3xl border-t border-slate-900 shadow-glass z-[99999] p-6 pb-12 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="text-indigo-400" size={18} />
                  <h3 className="font-black text-slate-100 uppercase text-xs tracking-wider">Allocate Savings Goals</h3>
                </div>
                <button
                  onClick={() => setIsAllocationOpen(false)}
                  className="p-1.5 bg-slate-900/80 rounded-full border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Visualizing concrete rewards dampens immediate cravings. Select a savings bucket to allocate the {formatCurrency(activeOrder?.totalSaved || 0, settings.currency)} saved from this meal!
              </p>

              {/* Goals List */}
              <div className="space-y-3.5">
                {goals.map((goal) => {
                  const isSelected = activeGoalId === goal.id;
                  const futureGoalProgressPercent = Math.min(
                    100,
                    Math.round(((goal.saved + (isSelected ? 0 : (activeOrder?.totalSaved || 0))) / goal.target) * 100)
                  );

                  return (
                    <div
                      key={goal.id}
                      onClick={() => { haptics.lightTap(); setActiveGoalId(goal.id); }}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-2.5 ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500 shadow-glass-glow'
                          : 'bg-darkcard/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{goal.emoji}</span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                            {goal.name}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500" 
                            style={{ width: `${futureGoalProgressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold font-mono text-slate-500">
                          <span>{formatCurrency(goal.saved, settings.currency)} / {formatCurrency(goal.target, settings.currency)}</span>
                          <span className={isSelected ? 'text-emerald-400' : ''}>{futureGoalProgressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confirm Button */}
              <button
                onClick={() => {
                  haptics.successNotification();
                  setIsAllocationOpen(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-accent-glow transition-all cursor-pointer active:scale-[0.98] text-xs uppercase tracking-widest"
              >
                <span>Allocate to {activeGoal.name} {activeGoal.emoji}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
export default ActiveOrderScreen;

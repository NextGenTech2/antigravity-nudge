import React from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, Award, ArrowRight, History, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { haptics } from '../services/haptics';

export const DashboardScreen: React.FC = () => {
  const { 
    savings, 
    history, 
    goals, 
    activeGoalId, 
    setActiveGoalId, 
    deliveryStage, 
    activeOrder, 
    currentTickingSavings 
  } = useAppStore();

  // 1. Mindful Streak Calculation
  const calculateStreak = () => {
    if (history.length === 0) return 0;
    
    // Sort history by timestamp descending
    const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
    
    // Get unique dates (toDateString)
    const dates = Array.from(new Set(sorted.map(log => new Date(log.timestamp).toDateString())));
    
    let streak = 0;
    const today = new Date();
    const latestLogDate = new Date(sorted[0].timestamp);
    
    // Check if the latest deflection was today or yesterday. If older, streak is broken (0).
    const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const latestMs = new Date(latestLogDate.getFullYear(), latestLogDate.getMonth(), latestLogDate.getDate()).getTime();
    const diffDays = (todayMs - latestMs) / (1000 * 60 * 60 * 24);
    
    if (diffDays > 1) {
      return 0;
    }
    
    // Count consecutive days going backward
    const checkDate = new Date(latestLogDate);
    while (true) {
      const dateStr = checkDate.toDateString();
      if (dates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // 2. Gamification: Level up every ₹1000 saved
  const level = Math.floor(savings / 1000) + 1;
  const nextLevelSavings = level * 1000;
  const currentLevelBase = (level - 1) * 1000;
  const levelProgress = savings > 0 ? (savings - currentLevelBase) : 0;
  const levelProgressPercent = Math.min(100, Math.max(0, (levelProgress / 1000) * 100));
  const remainingToLevelUp = nextLevelSavings - savings;

  // 3. Trigger Colors Configuration
  const triggerColors: Record<string, string> = {
    Boredom: '#818CF8',    // Indigo
    Stress: '#F43F5E',     // Rose
    Tiredness: '#F59E0B',  // Amber
    Loneliness: '#EC4899', // Pink
    Habit: '#10B981',      // Emerald
    Social: '#06B6D4',     // Cyan
    Other: '#64748B',      // Slate
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGoalSelect = (goalId: string) => {
    haptics.lightTap();
    setActiveGoalId(goalId);
  };

  return (
    <div className="w-full h-full flex flex-col bg-darkbg pb-24 overflow-y-auto">
      
      {/* Top Brand Header */}
      <div className="p-6 pb-2 pt-8 shrink-0 bg-darkbg">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <Target className="text-indigo-400" />
          Focus Hub
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Your prefrontal cortex dashboard. Reclaiming wealth & attention.
        </p>
      </div>

      {/* Real-Time Active Order HUD (Visible if a craving is being intercepted) */}
      {deliveryStage !== 'IDLE' && activeOrder && (
        <div className="px-6 py-2">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel rounded-2xl p-4 bg-gradient-to-r from-indigo-950/40 via-darkcard to-emerald-950/20 border-indigo-500/25 shadow-accent-glow flex items-center justify-between relative overflow-hidden"
          >
            {/* Pulsing indicator */}
            <div className="absolute top-0 right-0 h-1.5 w-1.5 bg-indigo-400 rounded-full animate-ping m-3" />
            
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 animate-pulse">
                Active Intercept Running
              </span>
              <h3 className="text-sm font-bold text-slate-200">{activeOrder.restaurantName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400 font-medium">Accumulating:</span>
                <span className="text-base font-black text-emerald-400 font-mono">₹{currentTickingSavings}</span>
              </div>
            </div>

            <button
              onClick={() => {
                haptics.lightTap();
                // We will let the user navigate to the browse tab manually or they can tap this
                // App.tsx will handle tab switching if they tap the mini-bar, but this is a helper
                const browseTab = document.querySelector('button[onClick*="browse"]') as HTMLButtonElement;
                if (browseTab) browseTab.click();
              }}
              className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-wider text-white rounded-lg flex items-center gap-1 shadow-glass-glow transition-all"
            >
              <span>View Map</span>
              <ArrowRight size={10} />
            </button>
          </motion.div>
        </div>
      )}

      {/* Mindful Streak Widget */}
      <div className="px-6 py-2">
        <div className="glass-panel rounded-2xl p-5 bg-gradient-to-br from-darkcard to-slate-900/60 border-slate-800/80 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl shadow-glass flex items-center justify-center">
              <Flame size={24} className={streak > 0 ? "animate-pulse" : "opacity-40"} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100 font-mono flex items-center gap-1.5">
                {streak} Day{streak !== 1 ? 's' : ''}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Mindful Streak
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal max-w-[180px]">
                {streak > 0 
                  ? "Outstanding! You are rewiring your habits day by day." 
                  : "Start a streak today by deflecting your first craving!"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-indigo-400 font-mono">₹{savings}</span>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Saved</p>
          </div>
        </div>
      </div>

      {/* Persistent Goals Vault */}
      <div className="px-6 py-3 space-y-3.5">
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>🎯</span> Savings Goals Vault
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {goals.map((goal) => {
            const isActive = activeGoalId === goal.id;
            const progressPercent = Math.min(100, Math.round((goal.saved / goal.target) * 100));

            return (
              <div
                key={goal.id}
                onClick={() => handleGoalSelect(goal.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-2.5 ${
                  isActive
                    ? 'bg-indigo-950/15 border-indigo-500/40 shadow-glass-glow'
                    : 'bg-darkcard/40 border-slate-850 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{goal.emoji}</span>
                    <span className={`text-xs font-black ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                      {goal.name}
                    </span>
                  </div>
                  {isActive && (
                    <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Target Goal
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold font-mono text-slate-500">
                    <span>₹{goal.saved} / ₹{goal.target}</span>
                    <span className={isActive ? 'text-emerald-400 font-extrabold' : ''}>{progressPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamification Level Milestone Card */}
      <div className="px-6 py-2">
        <div className="glass-panel rounded-2xl p-5 bg-gradient-to-br from-darkcard to-slate-900/40 border-slate-850 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shadow-glass flex items-center justify-center">
                <Award size={18} className="animate-float" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Level {level} Craving Calmer</h4>
                <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider mt-0.5">
                  ₹{remainingToLevelUp} to Level {level + 1}
                </p>
              </div>
            </div>
            <span className="text-xl font-black text-amber-400 font-mono">Lv.{level}</span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Financial Ledger / Deflection History */}
      <div className="px-6 py-4 space-y-3.5">
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <History size={15} className="text-indigo-400" />
          Financial Ledger
        </h3>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((log) => (
              <div
                key={log.id}
                className="glass-panel rounded-2xl p-4 bg-darkcard/35 border-slate-900 space-y-3 hover:border-slate-800 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">{log.restaurantName}</h4>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  
                  {/* Trigger Badge */}
                  <span
                    className="text-[9px] font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider"
                    style={{
                      borderColor: `${triggerColors[log.trigger] || '#6366F1'}25`,
                      backgroundColor: `${triggerColors[log.trigger] || '#6366F1'}10`,
                      color: triggerColors[log.trigger] || '#6366F1',
                    }}
                  >
                    {log.trigger}
                  </span>
                </div>

                {/* Items Saved */}
                <div className="text-xs text-slate-400 bg-slate-950/30 rounded-xl p-3 space-y-1.5">
                  {log.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between font-medium text-[11px]">
                      <span>{i.quantity}x {i.name}</span>
                      <span className="font-mono">₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-emerald-400 font-extrabold border-t border-slate-900 pt-2 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} />
                      <span>Reclaimed Wealth</span>
                    </span>
                    <span className="font-mono">+₹{log.amountSaved}</span>
                  </div>
                </div>

                {/* Reflection Notes */}
                {log.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-indigo-500/5 border-l-2 border-indigo-500/30 p-2.5 rounded-r-lg leading-relaxed">
                    "{log.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-panel rounded-2xl border-dashed border-slate-800/80 flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">No wealth reclaimed yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
                Go to the **Browse** tab, select a restaurant, and trigger a craving deflection to start saving!
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default DashboardScreen;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Flame, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  PieChart 
} from 'lucide-react';
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

  const [activeView, setActiveView] = useState<'dashboard' | 'reports'>('dashboard');
  const [reportsTab, setReportsTab] = useState<'trigger' | 'goal' | 'trend'>('trigger');
  const [expandedTrigger, setExpandedTrigger] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // 1. Mindful Streak Calculation
  const calculateStreak = () => {
    if (history.length === 0) return 0;
    const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
    const dates = Array.from(new Set(sorted.map(log => new Date(log.timestamp).toDateString())));
    
    let streak = 0;
    const today = new Date();
    const latestLogDate = new Date(sorted[0].timestamp);
    
    const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const latestMs = new Date(latestLogDate.getFullYear(), latestLogDate.getMonth(), latestLogDate.getDate()).getTime();
    const diffDays = (todayMs - latestMs) / (1000 * 60 * 60 * 24);
    
    if (diffDays > 1) return 0;
    
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

  // Group history by Trigger for analytics
  const triggerStats = history.reduce((acc, log) => {
    acc[log.trigger] = (acc[log.trigger] || 0) + log.amountSaved;
    return acc;
  }, {} as Record<string, number>);

  const sortedTriggerStats = Object.entries(triggerStats)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: savings > 0 ? Math.round((amount / savings) * 100) : 0,
      color: triggerColors[name] || '#6366F1',
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestSavingsTrigger = sortedTriggerStats.length > 0 ? sortedTriggerStats[0].name : null;

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

  // Render the Main Dashboard view
  const renderDashboardView = () => (
    <motion.div
      key="dashboard-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Real-Time Active Order HUD */}
      {deliveryStage !== 'IDLE' && activeOrder && (
        <div className="px-6 py-1">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel rounded-2xl p-4 bg-gradient-to-r from-indigo-950/40 via-darkcard to-emerald-950/20 border-indigo-500/25 shadow-accent-glow flex items-center justify-between relative overflow-hidden"
          >
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
      <div className="px-6 py-1">
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
      <div className="px-6 py-1 space-y-3">
        <h3 className="text-xs font-black text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
          <span>🎯</span> Savings Goals Vault
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
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
      <div className="px-6 py-1">
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

      {/* NEW: Wealth Reclaimed Insights Hero Card */}
      <div className="px-6 py-2">
        <div 
          onClick={() => {
            haptics.lightTap();
            setActiveView('reports');
          }}
          className="glass-panel rounded-2xl p-5 bg-gradient-to-br from-darkcard to-indigo-950/20 border-slate-800 hover:border-indigo-500/30 shadow-glass transition-all duration-300 cursor-pointer group space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <PieChart size={14} className="text-indigo-400" />
              Wealth Reclaimed Insights
            </h3>
            <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors flex items-center gap-1">
              View Analytics <ArrowRight size={10} />
            </span>
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-2xl font-black text-slate-100 font-mono">₹{savings}</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Avoided Capital</p>
            </div>
            
            <span className="text-[11px] text-slate-400 font-medium">
              {history.length} Interceptions logged
            </span>
          </div>

          {/* Trigger stacked distribution bar */}
          {history.length > 0 ? (
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
                {sortedTriggerStats.map((t) => (
                  <div
                    key={t.name}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${t.percentage}%`,
                      backgroundColor: t.color,
                    }}
                    title={`${t.name}: ${t.percentage}%`}
                  />
                ))}
              </div>
              
              <p className="text-[11px] text-slate-450 leading-relaxed">
                {highestSavingsTrigger ? (
                  <>
                    You've saved the most by avoiding{" "}
                    <span className="text-indigo-400 font-bold">{highestSavingsTrigger}</span> cravings.
                  </>
                ) : (
                  "Log craving deflections to map your behavioral spending leaks."
                )}
              </p>
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-slate-800/60 rounded-xl text-[11px] text-slate-500">
              No behavioral distribution data available yet.
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );

  // Render the Detailed Reports sub-screen
  const renderReportsView = () => {
    // Group history by Trigger
    const logsByTrigger = history.reduce((acc, log) => {
      acc[log.trigger] = acc[log.trigger] || [];
      acc[log.trigger].push(log);
      return acc;
    }, {} as Record<string, typeof history>);

    // Group history by Goal
    const logsByGoal = history.reduce((acc, log) => {
      const gId = log.goalId || 'phuket';
      acc[gId] = acc[gId] || [];
      acc[gId].push(log);
      return acc;
    }, {} as Record<string, typeof history>);

    // Dynamic SVG Line Graph Calculations for Tab C
    const renderTrendGraph = () => {
      if (history.length === 0) {
        return (
          <div className="text-center py-16 text-slate-500 text-xs">
            Log your first craving deflection to generate a savings trend graph.
          </div>
        );
      }

      // Sort history ascending to build cumulative data
      const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
      
      // Calculate running total
      let currentSum = 0;
      const dataPoints = sortedHistory.map((log) => {
        currentSum += log.amountSaved;
        return {
          x: log.timestamp,
          y: currentSum,
        };
      });

      // Add a starting point of 0 at (first log timestamp - 1 day)
      const firstTime = dataPoints[0].x;
      const startTime = firstTime - 24 * 60 * 60 * 1000;
      const points = [{ x: startTime, y: 0 }, ...dataPoints];

      const svgWidth = 320;
      const svgHeight = 180;
      const padding = 25;

      const minX = points[0].x;
      const maxX = points[points.length - 1].x;
      const minY = 0;
      const maxY = Math.max(...points.map(p => p.y)) * 1.15; // 15% padding on top

      const getSvgX = (x: number) => {
        if (maxX === minX) return padding + (svgWidth - 2 * padding) / 2;
        return padding + ((x - minX) / (maxX - minX)) * (svgWidth - 2 * padding);
      };

      const getSvgY = (y: number) => {
        return svgHeight - padding - ((y - minY) / (maxY - minY)) * (svgHeight - 2 * padding);
      };

      // Construct SVG path D string
      let pathD = `M ${getSvgX(points[0].x)} ${getSvgY(points[0].y)}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${getSvgX(points[i].x)} ${getSvgY(points[i].y)}`;
      }

      // Construct Area Path D string for gradient fill
      const areaD = `${pathD} L ${getSvgX(points[points.length - 1].x)} ${svgHeight - padding} L ${getSvgX(points[0].x)} ${svgHeight - padding} Z`;

      return (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl bg-darkcard/35 border-slate-900 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider self-start mb-2">
              Wealth Growth Trend
            </span>
            
            <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={getSvgY(minY)} x2={svgWidth - padding} y2={getSvgY(minY)} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={padding} y1={getSvgY(maxY / 2)} x2={svgWidth - padding} y2={getSvgY(maxY / 2)} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={padding} y1={getSvgY(maxY)} x2={svgWidth - padding} y2={getSvgY(maxY)} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

              {/* Area under curve */}
              <path d={areaD} fill="url(#areaGrad)" />

              {/* Line path */}
              <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />

              {/* End Point Dot */}
              {points.length > 0 && (
                <circle 
                  cx={getSvgX(points[points.length - 1].x)} 
                  cy={getSvgY(points[points.length - 1].y)} 
                  r="5" 
                  fill="#EC4899" 
                  stroke="#FFFFFF" 
                  strokeWidth="1.5" 
                />
              )}

              {/* Y-Axis Labels */}
              <text x={padding - 5} y={getSvgY(minY) + 4} textAnchor="end" fill="#475569" className="text-[9px] font-mono font-bold">₹0</text>
              <text x={padding - 5} y={getSvgY(maxY / 2) + 4} textAnchor="end" fill="#475569" className="text-[9px] font-mono font-bold">₹{Math.round(maxY / 2)}</text>
              <text x={padding - 5} y={getSvgY(maxY * 0.85) + 4} textAnchor="end" fill="#475569" className="text-[9px] font-mono font-bold">₹{Math.round(maxY * 0.85)}</text>
            </svg>

            <div className="flex justify-between w-full text-[9px] font-mono font-bold text-slate-500 px-2 mt-2">
              <span>{new Date(minX).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <span>Today</span>
            </div>
          </div>

          {/* Ledger summary card */}
          <div className="glass-panel p-4 rounded-2xl bg-darkcard/20 border-slate-900 space-y-3">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Financial Milestones Reached
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950/40 rounded-xl space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Initial Saving</span>
                <p className="text-sm font-black text-slate-200 font-mono">₹{sortedHistory[0]?.amountSaved || 0}</p>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Current Target</span>
                <p className="text-sm font-black text-indigo-400 font-mono">
                  {goals.find(g => g.id === activeGoalId)?.name.split(' ')[0] || 'Vault'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <motion.div
        key="reports-view"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="px-6 space-y-5"
      >
        {/* Back Button and Sub-page Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              haptics.lightTap();
              setActiveView('dashboard');
            }}
            className="p-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight">Wealth Insights</h2>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Behavioral Analytics</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-900">
          {(['trigger', 'goal', 'trend'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                haptics.lightTap();
                setReportsTab(tab);
              }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                reportsTab === tab
                  ? 'bg-indigo-600 text-white shadow-glass-glow'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'trigger' ? 'By Trigger' : tab === 'goal' ? 'By Goal' : 'Savings Trend'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {reportsTab === 'trigger' && (
            <motion.div
              key="trigger-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              {Object.keys(triggerColors).map((triggerName) => {
                const triggerLogs = logsByTrigger[triggerName] || [];
                const totalSavedForTrigger = triggerLogs.reduce((sum, log) => sum + log.amountSaved, 0);
                const isExpanded = expandedTrigger === triggerName;
                const percentage = savings > 0 ? Math.round((totalSavedForTrigger / savings) * 100) : 0;

                return (
                  <div 
                    key={triggerName}
                    className="glass-panel rounded-2xl border-slate-900 overflow-hidden bg-darkcard/25"
                  >
                    {/* Accordion Header */}
                    <div
                      onClick={() => {
                        if (triggerLogs.length > 0) {
                          haptics.lightTap();
                          setExpandedTrigger(isExpanded ? null : triggerName);
                        }
                      }}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        triggerLogs.length > 0 ? 'cursor-pointer hover:bg-slate-900/30' : 'opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="h-3 w-3 rounded-full shrink-0 shadow-lg" 
                          style={{ backgroundColor: triggerColors[triggerName] }} 
                        />
                        <div>
                          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">{triggerName}</h4>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">
                            {triggerLogs.length} Deflections
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-100 font-mono">₹{totalSavedForTrigger}</span>
                          <span className="text-[9px] text-slate-500 font-bold block font-mono">{percentage}%</span>
                        </div>
                        {triggerLogs.length > 0 && (
                          <div className="text-slate-500">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Deflection List */}
                    <AnimatePresence>
                      {isExpanded && triggerLogs.length > 0 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="border-t border-slate-900/60 bg-slate-950/20 overflow-hidden"
                        >
                          <div className="p-3.5 space-y-3">
                            {triggerLogs.map((log) => (
                              <div 
                                key={log.id} 
                                className="p-3 bg-slate-950/50 rounded-xl border border-slate-900/60 space-y-2"
                              >
                                <div className="flex justify-between text-xs font-bold text-slate-300">
                                  <span className="uppercase tracking-wide">{log.restaurantName}</span>
                                  <span className="text-emerald-400 font-mono">+₹{log.amountSaved}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold flex justify-between">
                                  <span>{formatDate(log.timestamp)}</span>
                                  <span className="line-clamp-1 max-w-[150px]">
                                    {log.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                  </span>
                                </div>
                                {log.notes && (
                                  <p className="text-[10px] text-slate-400 italic border-l border-slate-800 pl-2">
                                    "{log.notes}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {reportsTab === 'goal' && (
            <motion.div
              key="goal-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              {goals.map((goal) => {
                const goalLogs = logsByGoal[goal.id] || [];
                const totalSavedForGoal = goalLogs.reduce((sum, log) => sum + log.amountSaved, 0);
                const isExpanded = expandedGoal === goal.id;

                return (
                  <div 
                    key={goal.id}
                    className="glass-panel rounded-2xl border-slate-900 overflow-hidden bg-darkcard/25"
                  >
                    {/* Accordion Header */}
                    <div
                      onClick={() => {
                        if (goalLogs.length > 0) {
                          haptics.lightTap();
                          setExpandedGoal(isExpanded ? null : goal.id);
                        }
                      }}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        goalLogs.length > 0 ? 'cursor-pointer hover:bg-slate-900/30' : 'opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{goal.emoji}</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">{goal.name}</h4>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">
                            {goalLogs.length} Contributions
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-100 font-mono">₹{goal.saved}</span>
                          <span className="text-[9px] text-slate-500 font-bold block font-mono">
                            Target: ₹{goal.target}
                          </span>
                        </div>
                        {goalLogs.length > 0 && (
                          <div className="text-slate-500">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Contribution List */}
                    <AnimatePresence>
                      {isExpanded && goalLogs.length > 0 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="border-t border-slate-900/60 bg-slate-950/20 overflow-hidden"
                        >
                          <div className="p-3.5 space-y-3">
                            {goalLogs.map((log) => (
                              <div 
                                key={log.id} 
                                className="p-3 bg-slate-950/50 rounded-xl border border-slate-900/60 space-y-2"
                              >
                                <div className="flex justify-between text-xs font-bold text-slate-300">
                                  <span className="uppercase tracking-wide">{log.restaurantName}</span>
                                  <span className="text-emerald-400 font-mono">+₹{log.amountSaved}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold flex justify-between">
                                  <span>{formatDate(log.timestamp)}</span>
                                  <span 
                                    className="text-[9px] font-black px-1.5 py-0.2 rounded border uppercase tracking-wider"
                                    style={{
                                      borderColor: `${triggerColors[log.trigger] || '#6366F1'}25`,
                                      backgroundColor: `${triggerColors[log.trigger] || '#6366F1'}10`,
                                      color: triggerColors[log.trigger] || '#6366F1',
                                    }}
                                  >
                                    {log.trigger}
                                  </span>
                                </div>
                                {log.notes && (
                                  <p className="text-[10px] text-slate-400 italic border-l border-slate-800 pl-2">
                                    "{log.notes}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {reportsTab === 'trend' && (
            <motion.div
              key="trend-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {renderTrendGraph()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-darkbg pb-24 overflow-y-auto">
      
      {/* Top Brand Header */}
      {activeView === 'dashboard' && (
        <div className="p-6 pb-2 pt-8 shrink-0 bg-darkbg">
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Target className="text-indigo-400" />
            Focus Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Your prefrontal cortex dashboard. Reclaiming wealth & attention.
          </p>
        </div>
      )}

      {/* Main Body Content Switcher */}
      <div className="flex-1 pt-2">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' ? renderDashboardView() : renderReportsView()}
        </AnimatePresence>
      </div>

    </div>
  );
};
export default DashboardScreen;

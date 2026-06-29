import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Calendar, PiggyBank, Heart, Award } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const DashboardScreen: React.FC = () => {
  const { savings, history, deliveryStage } = useAppStore();

  const totalCravings = history.length;
  const avgSaved = totalCravings > 0 ? Math.round(savings / totalCravings) : 0;

  // Gamification: Level up every ₹1000 saved
  const level = Math.floor(savings / 1000) + 1;
  const nextLevelSavings = level * 1000;
  const currentLevelBase = (level - 1) * 1000;
  const levelProgress = savings > 0 ? ((savings - currentLevelBase) / 1000) * 1000 : 0; // out of 1000
  const progressPercent = Math.min(100, Math.max(0, (levelProgress / 1000) * 100));

  // Compute trigger frequencies for the analytics chart
  const triggerColors: Record<string, string> = {
    Boredom: '#818CF8',    // Indigo
    Stress: '#F43F5E',     // Rose/Pink
    Tiredness: '#F59E0B',  // Amber
    Loneliness: '#EC4899', // Pink
    Habit: '#10B981',      // Emerald
    Social: '#06B6D4',     // Cyan
    Other: '#64748B',      // Slate
  };

  const triggerStats = history.reduce((acc, log) => {
    acc[log.trigger] = (acc[log.trigger] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTriggers = Object.entries(triggerStats)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalCravings > 0 ? Math.round((count / totalCravings) * 100) : 0,
      color: triggerColors[name] || '#6366F1',
    }))
    .sort((a, b) => b.count - a.count);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-darkbg pb-48 overflow-y-auto">
      {/* Title */}
      <div className={`p-6 pb-2 transition-all duration-300 ${deliveryStage !== 'IDLE' ? 'pt-24' : 'pt-8'}`}>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <PiggyBank className="text-indigo-400" />
          Savings Vault
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Track the wealth and health you've reclaimed.
        </p>
      </div>

      {/* Gamified Level Card */}
      <div className="px-6 py-2">
        <div className="glass-panel rounded-2xl p-5 bg-gradient-to-br from-darkcard to-slate-900/60 border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shadow-glass">
                <Award size={20} className="animate-float" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Craving Calmer Level {level}</h4>
                <p className="text-[10px] text-slate-400 font-medium">₹{1000 - (savings % 1000)} to Level {level + 1}</p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-amber-400">Lv.{level}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden mb-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-500"
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
            <span>₹{currentLevelBase}</span>
            <span>₹{nextLevelSavings}</span>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="px-6 py-2 grid grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-4 bg-darkcard/40 border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cravings Deflected</span>
          <span className="text-2xl font-black text-slate-100 mt-2">{totalCravings}</span>
        </div>
        <div className="glass-panel rounded-2xl p-4 bg-darkcard/40 border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg. Saved</span>
          <span className="text-2xl font-black text-indigo-400 mt-2">₹{avgSaved}</span>
        </div>
      </div>

      {/* Pure SVG Trigger Analytics Chart */}
      {totalCravings > 0 && (
        <div className="px-6 py-4">
          <div className="glass-panel rounded-2xl p-5 bg-darkcard/20 border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BarChart2 size={14} className="text-indigo-400" />
              Emotional Triggers
            </h3>
            
            <div className="space-y-3">
              {sortedTriggers.map((t) => (
                <div key={t.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </span>
                    <span>{t.percentage}% ({t.count})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resisted Cravings History */}
      <div className="px-6 py-2 space-y-4">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-400" />
          Deflection History
        </h3>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((log) => (
              <div
                key={log.id}
                className="glass-panel rounded-2xl p-4 bg-darkcard/50 border-slate-800/80 space-y-3 hover:border-slate-800 transition-colors"
              >
                {/* Log Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-200">{log.restaurantName}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  
                  {/* Trigger Badge */}
                  <span
                    className="text-[9px] font-bold px-2.5 py-0.8 rounded-lg border uppercase tracking-wider"
                    style={{
                      borderColor: `${triggerColors[log.trigger] || '#6366F1'}30`,
                      backgroundColor: `${triggerColors[log.trigger] || '#6366F1'}10`,
                      color: triggerColors[log.trigger] || '#6366F1',
                    }}
                  >
                    {log.trigger}
                  </span>
                </div>

                {/* Items Saved */}
                <div className="text-xs text-slate-400 bg-slate-950/40 rounded-lg p-2.5 space-y-1">
                  {log.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between font-medium">
                      <span>{i.quantity}x {i.name}</span>
                      <span>₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800/80 pt-1.5 mt-1.5">
                    <span>Amount Saved</span>
                    <span>₹{log.amountSaved}</span>
                  </div>
                </div>

                {/* Reflection Notes */}
                {log.notes && (
                  <p className="text-xs text-slate-400 italic bg-indigo-500/5 border-l-2 border-indigo-500/30 p-2.5 rounded-r-lg">
                    "{log.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-panel rounded-2xl border-dashed border-slate-800/80 flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
              <Heart size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">Your savings vault is empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
                Log a craving deflection to watch your savings grow and unlock your levels!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardScreen;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, Lightbulb, ShieldAlert } from 'lucide-react';
import { haptics } from '../services/haptics';

interface DopamineCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TriggerType = 'BOREDOM' | 'STRESS' | 'REWARD' | 'LATE_NIGHT';

export const DopamineCalculatorModal: React.FC<DopamineCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [frequency, setFrequency] = useState<number>(3); // orders per week
  const [orderValue, setOrderValue] = useState<number>(350); // average cost in INR
  const [trigger, setTrigger] = useState<TriggerType>('BOREDOM');

  if (!isOpen) return null;

  // Calculations
  const weeklySpend = frequency * orderValue;
  const monthlySpend = Math.round(weeklySpend * 4.33);
  const yearlySpend = weeklySpend * 52;

  // 10-Year Opportunity Cost (assuming 12% CAGR mutual fund investment, compounded monthly)
  // FV = P * [((1 + r/n)^(nt) - 1) / (r/n)]
  const r = 0.12; // 12% annual return
  const n = 12; // monthly compounding
  const t = 10; // 10 years
  const monthlyRate = r / n;
  const totalMonths = n * t;
  const futureValue = Math.round(
    monthlySpend * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
  );

  // Trigger Explanations & Action Plans
  const TRIGGER_DATA = {
    BOREDOM: {
      title: 'Boredom Eating Loop 🥱',
      desc: 'You are seeking a quick hit of novelty to stimulate an under-active brain. Online ordering provides a high-anticipation dopamine spike with minimal physical effort.',
      advice: 'Disrupt the cue by opening the Focus Challenge game. Diverting your visual processing centers for just 30 seconds will collapse the boredom-ordering loop.',
    },
    STRESS: {
      title: 'Stress-Induced Cortisol Loop 😰',
      desc: 'You are using food as a temporary chemical stabilizer. High stress levels release cortisol, which chemically biases your brain toward calorie-dense comfort foods.',
      advice: 'Calm your nervous system immediately. Activate our Box Breathing module for 60 seconds to lower your heart rate and deactivate the cortisol-driven craving.',
    },
    REWARD: {
      title: 'Reward Association Loop 🎉',
      desc: 'Your brain associates achievement or completing a hard day with food indulgence. This positive reinforcement makes healthy restraint feel like a punishment.',
      advice: 'Reframe the reward. When you resist a craving, look at your Savings Vault. Watch the money instantly transfer to your weekend trip or gadget goals.',
    },
    LATE_NIGHT: {
      title: 'Sleep-Deprivation Ghrelin Spike 🌙',
      desc: 'Fatigue lowers your prefrontal cortex\'s willpower. Sleep debt suppresses leptin (satiety hormone) and increases ghrelin (hunger hormone), triggering intense late-night cravings.',
      advice: 'Your brain is just tired, not hungry. Drink a glass of water, lock your phone, and let our 60-second breathing cycle transition you into sleep mode.',
    },
  };

  const handleClose = () => {
    haptics.lightTap();
    onClose();
  };

  const handleTriggerSelect = (type: TriggerType) => {
    haptics.lightTap();
    setTrigger(type);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Dark Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-darkcard w-full max-w-lg rounded-2xl p-6 shadow-card-elevation border border-slate-800/80 overflow-y-auto max-h-[90vh] flex flex-col z-10 text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>🧠</span> Dopamine & Spending Assessment
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              See the real-world financial and neurological cost of your ordering habits.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 bg-slate-900/60 border border-slate-800 text-slate-400 rounded-full hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 flex-1 pr-1 overflow-y-auto">
          {/* Sliders Section */}
          <div className="space-y-4 bg-slate-900/30 border border-slate-800/40 p-4 rounded-xl">
            {/* Frequency Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Orders Per Week</span>
                <span className="text-indigo-400 font-bold font-mono">{frequency} times</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={frequency}
                onChange={(e) => {
                  haptics.lightTap();
                  setFrequency(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Average Order Cost Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Average Order Value</span>
                <span className="text-emerald-400 font-bold font-mono">₹{orderValue}</span>
              </div>
              <input
                type="range"
                min="150"
                max="1500"
                step="50"
                value={orderValue}
                onChange={(e) => {
                  haptics.lightTap();
                  setOrderValue(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Dynamic Results Display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/40 border border-slate-800/40 p-3.5 rounded-xl text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Annual Spending</span>
              <span className="text-xl font-black text-rose-400 font-mono">₹{yearlySpend.toLocaleString('en-IN')}</span>
              <p className="text-[9px] text-slate-500 mt-1">Direct cash drained from your account every 12 months.</p>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl text-left relative overflow-hidden">
              <div className="absolute top-1 right-1 text-emerald-500/20"><TrendingUp size={40} /></div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">10-Year Opportunity Cost</span>
              <span className="text-xl font-black text-emerald-400 font-mono">₹{futureValue.toLocaleString('en-IN')}</span>
              <p className="text-[9px] text-slate-400 mt-1">If saved and invested in a mutual fund @ 12% CAGR.</p>
            </div>
          </div>

          {/* Trigger Selection */}
          <div className="space-y-2.5">
            <span className="text-xs text-slate-300 font-semibold block">Identify Your Primary Cravings Trigger:</span>
            <div className="grid grid-cols-4 gap-2">
              {(['BOREDOM', 'STRESS', 'REWARD', 'LATE_NIGHT'] as TriggerType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTriggerSelect(type)}
                  className={`py-2 px-1 text-center rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    trigger === type
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-glass-glow'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-750'
                  }`}
                >
                  <span>{type === 'BOREDOM' ? '🥱' : type === 'STRESS' ? '😰' : type === 'REWARD' ? '🎉' : '🌙'}</span>
                  <span className="truncate max-w-full">
                    {type === 'BOREDOM' ? 'Bored' : type === 'STRESS' ? 'Stressed' : type === 'REWARD' ? 'Reward' : 'Night'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Behavioral Assessment Result */}
          <div className="bg-indigo-950/25 border border-indigo-500/15 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldAlert size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider">{TRIGGER_DATA[trigger].title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {TRIGGER_DATA[trigger].desc}
            </p>
            <div className="bg-indigo-950/45 border border-indigo-500/10 p-3 rounded-lg flex gap-2.5 items-start">
              <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-0.5">Behavioral Antidote</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {TRIGGER_DATA[trigger].advice}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 shrink-0 flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-glass transition-all active:scale-95 cursor-pointer text-center"
          >
            Start Intercepting Cravings
          </button>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CravingLog } from '../store/useAppStore';
import { haptics } from '../services/haptics';

interface CravingsLogModalProps {
  isOpen: boolean;
  amountSaved: number;
  restaurantName: string;
  onSave: (trigger: CravingLog['trigger'], notes: string) => void;
}

const TRIGGERS: { value: CravingLog['trigger']; emoji: string; label: string }[] = [
  { value: 'Boredom', emoji: '🥱', label: 'Boredom' },
  { value: 'Stress', emoji: '😰', label: 'Stress' },
  { value: 'Tiredness', emoji: '😴', label: 'Tiredness' },
  { value: 'Loneliness', emoji: '😔', label: 'Loneliness' },
  { value: 'Habit', emoji: '🔄', label: 'Habit' },
  { value: 'Social', emoji: '👥', label: 'Social' },
  { value: 'Other', emoji: '💭', label: 'Other' },
];

export const CravingsLogModal: React.FC<CravingsLogModalProps> = ({
  isOpen,
  amountSaved,
  restaurantName,
  onSave,
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState<CravingLog['trigger'] | null>(null);
  const [notes, setNotes] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger a premium double-confetti burst!
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366F1', '#10B981', '#FF2E93'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366F1', '#10B981', '#FF2E93'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [isOpen]);

  const handleTriggerSelect = (trigger: CravingLog['trigger']) => {
    haptics.lightTap();
    setSelectedTrigger(trigger);
    setShowError(false);
  };

  const handleSubmit = () => {
    if (!selectedTrigger) {
      haptics.warningNotification();
      setShowError(true);
      return;
    }
    haptics.successNotification();
    onSave(selectedTrigger, notes);
    // Reset local states
    setSelectedTrigger(null);
    setNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass-panel w-full max-w-sm rounded-2xl p-6 bg-darkcard shadow-glass border-slate-800/80 z-10 overflow-y-auto max-h-[85vh]"
          >
            {/* Success Celebration */}
            <div className="text-center space-y-2 mb-6">
              <div className="mx-auto h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shadow-success-glow mb-2 animate-float">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-100 flex items-center justify-center gap-1.5">
                Craving Deflected! <Sparkles size={18} className="text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-sm text-slate-400">
                You successfully resisted ordering from <span className="font-semibold text-slate-200">{restaurantName}</span>.
              </p>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 py-3 px-4 rounded-xl mt-4">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Deposited to Savings</span>
                <span className="text-3xl font-black text-emerald-400">₹{amountSaved}</span>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  What triggered this craving?
                </label>
                
                {/* Trigger Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {TRIGGERS.map((t) => {
                    const isSelected = selectedTrigger === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => handleTriggerSelect(t.value)}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-500/20 border-indigo-500 text-slate-100 font-semibold shadow-glass-glow scale-[1.03]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-lg">{t.emoji}</span>
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {showError && (
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 font-medium animate-pulse">
                    <AlertCircle size={14} />
                    <span>Please select a trigger to log your saving.</span>
                  </div>
                )}
              </div>

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Add reflections (optional)
                </label>
                <textarea
                  placeholder="e.g. I was bored working late. Writing this down helped me realize I wasn't actually hungry."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-20 glass-input rounded-xl p-3 text-xs resize-none placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-success-glow transition-all cursor-pointer mt-2 active:scale-[0.98]"
              >
                <Heart size={16} className="fill-white" />
                <span>Log Savings & Exit</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default CravingsLogModal;

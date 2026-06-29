import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, LayoutDashboard, Settings, Lock, AlertCircle } from 'lucide-react';
import { haptics } from '../services/haptics';

export type ScreenType = 'browse' | 'dashboard' | 'settings';

interface BottomNavigationProps {
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;
  isSimulating: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeScreen,
  setActiveScreen,
  isSimulating,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const navItems = [
    { id: 'dashboard' as ScreenType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'browse' as ScreenType, label: 'Browse', icon: Compass },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (id: ScreenType) => {
    if (isSimulating && id === 'browse') {
      haptics.warningNotification();
      setShowTooltip(true);
      return;
    }
    haptics.lightTap();
    setActiveScreen(id);
  };

  // Automatically hide the tooltip after 2.5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[env(safe-area-inset-bottom)]">
      {/* Locked Tooltip Popover */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 glass-panel bg-slate-950/95 border-indigo-500/30 py-2.5 px-4 rounded-xl shadow-glass text-center z-50 flex items-center gap-2 justify-center"
          >
            <AlertCircle size={14} className="text-indigo-400 shrink-0" />
            <span className="text-[10px] text-slate-300 font-semibold leading-normal">
              Browse locked until your order is delivered to help you stay on track.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-panel rounded-2xl py-3 px-6 flex justify-around items-center shadow-glass backdrop-blur-md max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          const isLocked = isSimulating && item.id === 'browse';

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative py-2 px-4 flex flex-col items-center gap-1 focus:outline-none transition-all duration-250 ${
                isLocked ? 'opacity-40 cursor-not-allowed filter grayscale' : 'cursor-pointer'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Sliding background pill for the active tab */}
              {isActive && !isLocked && (
                <motion.div
                  layoutId="activeNavigationPill"
                  className="absolute inset-0 bg-brand-500/10 border border-brand-500/20 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <motion.div
                animate={{
                  scale: isActive && !isLocked ? 1.15 : 1,
                  color: isActive && !isLocked ? '#6366F1' : '#94A3B8',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative"
              >
                {isLocked ? (
                  <>
                    <Icon size={22} className="text-slate-500" />
                    <Lock size={10} className="absolute -top-1 -right-1 text-indigo-400 bg-slate-950 rounded-full p-0.5 border border-slate-800" />
                  </>
                ) : (
                  <Icon size={22} className={isActive ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : ""} />
                )}
              </motion.div>

              <span
                className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${
                  isActive && !isLocked ? 'text-indigo-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default BottomNavigation;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, HelpCircle, Eye, EyeOff, LogOut, Trash2, Smartphone, User, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { logoutUser } from '../services/firebase';
import { haptics } from '../services/haptics';

export const SettingsScreen: React.FC = () => {
  const { user, settings, deliveryStage, updateSettings, logout, resetAllData } = useAppStore();
  
  const [apiKey, setApiKey] = useState(settings.openaiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isResetConfirm, setIsResetConfirm] = useState(false);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    updateSettings({ openaiApiKey: val });
  };

  const toggleHaptics = () => {
    haptics.lightTap();
    updateSettings({ hapticsEnabled: !settings.hapticsEnabled });
  };

  const handleLogout = async () => {
    haptics.lightTap();
    await logoutUser();
    logout();
  };

  const handleReset = () => {
    if (!isResetConfirm) {
      haptics.warningNotification();
      setIsResetConfirm(true);
      return;
    }
    
    haptics.successNotification();
    resetAllData();
    setApiKey('');
    setIsResetConfirm(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-darkbg pb-24 overflow-y-auto">
      {/* Title */}
      <div className={`p-6 pb-2 transition-all duration-300 ${deliveryStage !== 'IDLE' ? 'pt-24' : 'pt-8'}`}>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="text-indigo-400" />
          Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure your cognitive training environment.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="px-6 py-3">
        <div className="glass-panel rounded-2xl p-4 bg-darkcard/40 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-10 w-10 rounded-full border border-slate-700" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-indigo-400 border border-slate-800">
                <User size={18} />
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-200">{user?.displayName || 'User'}</h4>
              <p className="text-[10px] text-slate-500 font-medium">
                {user?.isGuest ? 'Guest Mode Account' : user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl border border-slate-800 hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Haptics Settings */}
      <div className="px-6 py-3">
        <div className="glass-panel rounded-2xl p-4 bg-darkcard/40 border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone size={14} className="text-indigo-400" />
            Haptic Preferences
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Vibration Feedback</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Tactile clicks on cart additions and milestones.</p>
            </div>
            
            {/* Custom Sliding Toggle */}
            <button
              onClick={toggleHaptics}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none ${
                settings.hapticsEnabled ? 'bg-indigo-600' : 'bg-slate-850 border border-slate-800'
              }`}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-lg"
                animate={{ x: settings.hapticsEnabled ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Preferences */}
      <div className="px-6 py-3">
        <div className="glass-panel rounded-2xl p-4 bg-darkcard/40 border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone size={14} className="text-indigo-400" />
            Simulation Speed
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Fast Mode (Testing)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Compresses 1 minute of waiting into 1 second.</p>
            </div>
            
            {/* Custom Sliding Toggle */}
            <button
              onClick={() => {
                haptics.lightTap();
                updateSettings({ fastModeEnabled: !settings.fastModeEnabled });
              }}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none ${
                settings.fastModeEnabled ? 'bg-indigo-600' : 'bg-slate-850 border border-slate-800'
              }`}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-lg"
                animate={{ x: settings.fastModeEnabled ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* AI Image Generation Settings */}
      <div className="px-6 py-3">
        <div className="glass-panel rounded-2xl p-5 bg-darkcard/40 border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Key size={14} className="text-indigo-400" />
            AI Image Generator
          </h3>

          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              By default, the app uses a free, no-key Stable Diffusion model (Pollinations AI) to generate food photos. 
              Input an OpenAI API Key to upgrade image rendering to DALL-E 3.
            </p>

            <div className="relative mt-2">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-proj-..."
                value={apiKey}
                onChange={handleApiKeyChange}
                className="w-full h-10 pl-3 pr-10 rounded-xl glass-input text-xs placeholder:text-slate-700 focus:outline-none"
              />
              <button
                onClick={() => { haptics.lightTap(); setShowKey(!showKey); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="px-6 py-3">
        <div className="glass-panel rounded-2xl p-5 bg-darkcard/40 border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={14} className="text-indigo-400" />
            The Science
          </h3>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Takeout ordering creates a massive dopamine spike during the <strong>anticipation</strong> phase. 
            By choosing items, placing an order, and watching a delivery rider approach on a map, your brain experiences 
            a simulated reward loop. 
          </p>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            By the time the "order" arrives, the craving has subsided, and you are rewarded with a celebration of the 
            exact amount of money you saved, reinforcing positive habits.
          </p>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="px-6 py-3">
        <div className="glass-panel rounded-2xl p-5 bg-darkcard/40 border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw size={14} className="text-indigo-400" />
            Troubleshooting
          </h3>
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              If the app feels stuck, isn't loading new content, or you just updated it to your home screen, you can force a complete reload.
            </p>
            <button
              onClick={() => { haptics.lightTap(); window.location.reload(); }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30"
            >
              Force App Reload
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="px-6 py-4 mt-4">
        <div className="glass-panel rounded-2xl p-5 bg-slate-950/20 border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Trash2 size={14} className="text-rose-550" />
            Danger Zone
          </h3>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              This will permanently delete all your savings history, cravings logs, and custom settings. This action cannot be undone.
            </p>
            
            <button
              onClick={handleReset}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center border ${
                isResetConfirm
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-transparent text-rose-400 border-rose-500/20 hover:bg-rose-500/10'
              }`}
            >
              {isResetConfirm ? 'Tap Again to Wipe All Data' : 'Reset All Local Data'}
            </button>
            {isResetConfirm && (
              <button
                onClick={() => { haptics.lightTap(); setIsResetConfirm(false); }}
                className="text-center text-[10px] text-slate-500 hover:text-slate-400 cursor-pointer font-semibold"
              >
                Cancel Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsScreen;

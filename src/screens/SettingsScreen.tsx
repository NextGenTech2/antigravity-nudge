import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, HelpCircle, Eye, EyeOff, LogOut, Trash2, Smartphone, User, RefreshCw, Globe, MapPin, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { logoutUser } from '../services/firebase';
import { haptics } from '../services/haptics';

const PRESET_CITIES = [
  { name: 'Bengaluru, India', coords: [12.9716, 77.5946] as [number, number] },
  { name: 'Mumbai, India', coords: [19.0760, 72.8777] as [number, number] },
  { name: 'New York, USA', coords: [40.7128, -74.0060] as [number, number] },
  { name: 'London, UK', coords: [51.5074, -0.1278] as [number, number] },
  { name: 'Tokyo, Japan', coords: [35.6762, 139.6503] as [number, number] },
  { name: 'Sydney, Australia', coords: [-33.8688, 151.2093] as [number, number] },
  { name: 'Paris, France', coords: [48.8566, 2.3522] as [number, number] },
  { name: 'Toronto, Canada', coords: [43.6532, -79.3832] as [number, number] },
  { name: 'Berlin, Germany', coords: [52.5200, 13.4050] as [number, number] },
  { name: 'Singapore', coords: [1.3521, 103.8198] as [number, number] },
  { name: 'Dubai, UAE', coords: [25.2048, 55.2708] as [number, number] },
];

export const SettingsScreen: React.FC = () => {
  const { user, settings, deliveryStage, updateSettings, logout, resetAllData } = useAppStore();
  
  const [apiKey, setApiKey] = useState(settings.openaiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isResetConfirm, setIsResetConfirm] = useState(false);
  
  // Location Detection States
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    updateSettings({ openaiApiKey: val });
  };

  const toggleHaptics = () => {
    haptics.lightTap();
    updateSettings({ hapticsEnabled: !settings.hapticsEnabled });
  };

  const handleCurrencyChange = (curr: 'INR' | 'USD' | 'GBP') => {
    haptics.mediumTap();
    if (confirm("Changing currency will clear your current savings and craving logs to align with the new currency scale. Do you want to proceed?")) {
      let defaultCity = 'Bengaluru, India';
      let defaultCoords: [number, number] = [12.9716, 77.5946];

      if (curr === 'USD') {
        defaultCity = 'New York, USA';
        defaultCoords = [40.7128, -74.0060];
      } else if (curr === 'GBP') {
        defaultCity = 'London, UK';
        defaultCoords = [51.5074, -0.1278];
      }

      updateSettings({
        currency: curr,
        simulationCity: defaultCity,
        customCoords: defaultCoords,
      });
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    haptics.lightTap();
    const cityName = e.target.value;
    const selected = PRESET_CITIES.find(c => c.name === cityName);
    if (selected) {
      updateSettings({
        simulationCity: cityName,
        customCoords: selected.coords,
      });
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      haptics.warningNotification();
      setDetectError('GPS is not supported by your device.');
      return;
    }

    haptics.lightTap();
    setIsDetecting(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Keyless Nominatim reverse-geocoding API call
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'AntiDopaminePWA/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Detected Location';
            
            updateSettings({
              simulationCity: city,
              customCoords: [latitude, longitude],
            });
            haptics.successNotification();
          } else {
            throw new Error('Reverse geocoding failed');
          }
        } catch (err) {
          console.error(err);
          // Fallback if geocoding fails but GPS works
          updateSettings({
            simulationCity: 'Detected Location',
            customCoords: [latitude, longitude],
          });
          haptics.successNotification();
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error(error);
        haptics.warningNotification();
        setDetectError('Location access denied or failed.');
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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

      {/* Locale & Currency Settings */}
      <div className="px-6 py-3">
        <div className="glass-panel rounded-2xl p-4 bg-darkcard/40 border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={14} className="text-indigo-400" />
            Locale & Currency
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Active Currency</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Formats menus, vaults, and live savings tracking.</p>
              </div>
              
              {/* Segmented control */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                {(['INR', 'USD', 'GBP'] as const).map((curr) => {
                  const isSelected = settings.currency === curr;
                  return (
                    <button
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {curr === 'INR' ? '₹' : curr === 'USD' ? '$' : '£'}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <p className="text-[9px] text-slate-500 leading-relaxed pt-1.5 border-t border-slate-850/60">
              ⚠️ Changing currency will reset your historical logs and savings balances to prevent scaling inconsistencies.
            </p>
          </div>
        </div>
      </div>

      {/* Simulation Location Settings */}
      <div className="px-6 py-3">
        <div className="glass-panel rounded-2xl p-4 bg-darkcard/40 border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={14} className="text-indigo-400" />
            Simulation Location
          </h3>

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-200">Map Starting Point</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Where the simulated courier begins their route.</p>
            </div>

            {/* Selector Dropdown */}
            <select
              value={settings.simulationCity}
              onChange={handleCityChange}
              className="w-full h-10 px-3 rounded-xl glass-input text-xs focus:outline-none cursor-pointer"
            >
              {/* If we have a custom detected city, include it as an option */}
              {!PRESET_CITIES.some(c => c.name === settings.simulationCity) && (
                <option value={settings.simulationCity}>
                  📍 {settings.simulationCity} (Detected)
                </option>
              )}
              {PRESET_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* GPS Detector button */}
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center bg-indigo-600/20 text-indigo-450 border border-indigo-500/30 hover:bg-indigo-500/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isDetecting ? (
                <>
                  <Loader2 size={14} className="animate-spin text-indigo-400" />
                  <span>Detecting Location...</span>
                </>
              ) : (
                <>
                  <MapPin size={14} />
                  <span>Auto-Detect My City (GPS)</span>
                </>
              )}
            </button>

            {detectError && (
              <p className="text-[9px] text-rose-450 font-medium">{detectError}</p>
            )}
          </div>
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
                  : 'bg-transparent text-rose-450 border-rose-500/20 hover:bg-rose-500/10'
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

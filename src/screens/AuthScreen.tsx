import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Sparkles, LogIn, User } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { loginWithGoogle, isFirebaseConfigured } from '../services/firebase';
import { haptics } from '../services/haptics';

export const AuthScreen: React.FC = () => {
  const { setUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    haptics.lightTap();
    setLoading(true);
    setError(null);
    try {
      const firebaseUser = await loginWithGoogle();
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isGuest: false,
      });
    } catch (err: any) {
      console.error(err);
      if (!isFirebaseConfigured) {
        setError("Google Sign-In requires Firebase configuration. Please proceed with Guest Mode!");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    haptics.successNotification();
    setUser({
      uid: `guest_${Date.now()}`,
      email: null,
      displayName: 'Craving Conqueror',
      photoURL: null,
      isGuest: true,
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-darkbg p-6 pb-12 overflow-y-auto">
      {/* Decorative Glows */}
      <div className="absolute top-10 left-10 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 h-64 w-64 bg-rose-500/5 rounded-full blur-3xl -z-10" />

      {/* Top Brand / Logo */}
      <div className="pt-12 text-center flex flex-col items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-accent-glow mb-4"
        >
          <span className="text-3xl font-black text-white">𝛀</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black tracking-tight text-slate-100"
        >
          Anti-Cravings
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mt-1.5 flex items-center gap-1"
        >
          <Sparkles size={12} className="animate-pulse text-indigo-400" />
          Dopamine Rewire Engine
        </motion.p>
      </div>

      {/* Core Concept Pitch */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-panel rounded-2xl p-6 bg-darkcard/40 border-slate-800 text-center space-y-4 my-8"
      >
        <h3 className="font-bold text-slate-200">How it works</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Whenever you feel the urge to order expensive takeout, open this app. Browse our menus and add your cravings to the cart.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          We'll simulate the delivery path in real-time, satisfy your brain's anticipation response, and redirect the saved funds to your vault.
        </p>
      </motion.div>

      {/* Auth Actions */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        {error && (
          <div className="glass-panel bg-rose-500/5 border-rose-500/20 p-4 rounded-xl flex items-start gap-3 text-left">
            <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-bold text-rose-300">Authentication Alert</p>
              <p className="text-[10px] text-rose-400/90 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-accent-glow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <LogIn size={18} />
          <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full h-12 glass-panel hover:bg-slate-800/40 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <User size={18} className="text-slate-400" />
          <span>Enter as Guest</span>
        </button>

        <p className="text-[10px] text-center text-slate-600 font-medium">
          Zero real-world payments. Fully local cognitive training tool.
        </p>
      </motion.div>
    </div>
  );
};
export default AuthScreen;

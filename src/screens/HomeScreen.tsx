import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Compass, Award } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Restaurant } from '../types/restaurant';
import restaurantsData from '../data/restaurants.json';
import RestaurantCard from '../components/RestaurantCard';
import { haptics } from '../services/haptics';

interface HomeScreenProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
  { id: 'indian', label: 'Indian', emoji: '🍛' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectRestaurant }) => {
  const { user, savings } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cast the imported JSON to the strict Restaurant[] interface
  const restaurants: Restaurant[] = restaurantsData as Restaurant[];

  const handleCategorySelect = (categoryId: string) => {
    haptics.lightTap();
    setSelectedCategory(categoryId);
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      r.name.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const displayName = user?.displayName || (user?.isGuest ? 'Craving Conqueror' : 'Friend');

  return (
    <div className="w-full h-full flex flex-col bg-darkbg pb-24 overflow-y-auto">
      {/* Header Profile Section */}
      <div className="p-6 pb-2 pt-8 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={12} className="animate-pulse" />
            Stay strong
          </span>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Hey, {displayName}!
          </h1>
        </div>

        {/* Level badge */}
        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl shadow-glass-glow">
          <Award size={16} className="text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300">
            Lv. {Math.floor(savings / 1000) + 1}
          </span>
        </div>
      </div>

      {/* Savings Spotlight Card */}
      <div className="px-6 py-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="glass-panel rounded-2xl p-5 bg-gradient-to-br from-darkcard to-indigo-950/20 border-indigo-500/10 shadow-glass-glow relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Saved Money</p>
              <h2 className="text-4xl font-black text-emerald-400 mt-1.5 tracking-tight drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                ₹{savings}
              </h2>
            </div>
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 relative z-10 font-medium">
            <span className="text-emerald-400 font-bold">Excellent job!</span>
            <span>You are building healthy habits every day.</span>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search restaurants, cuisines, cravings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl glass-input text-sm placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="py-4">
        <div className="flex gap-2.5 overflow-x-auto px-6 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-brand-500 text-white border-brand-600 shadow-glass-glow'
                    : 'bg-darkcard/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Restaurants List */}
      <div className="px-6 py-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
            <Compass size={18} className="text-indigo-400" />
            Browse Local Temptations
          </h2>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {filteredRestaurants.length} open
          </span>
        </div>

        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {filteredRestaurants.map((rest) => (
              <RestaurantCard
                key={rest.id}
                restaurant={rest}
                onClick={() => onSelectRestaurant(rest)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl border-dashed border-slate-800">
            <p className="text-sm text-slate-500">No restaurants matching your search.</p>
            <p className="text-xs text-indigo-400/80 mt-1 cursor-pointer font-semibold" onClick={() => handleCategorySelect('all')}>
              Clear filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default HomeScreen;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Compass, Award, Plus, Minus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Restaurant } from '../types/restaurant';
import menuInData from '../data/menu_in.json';
import menuUsData from '../data/menu_us.json';
import menuUkData from '../data/menu_uk.json';
import { formatCurrency } from '../services/currency';
import RestaurantCard from '../components/RestaurantCard';
import { haptics } from '../services/haptics';
import { imageGenerator } from '../services/imageGenerator';

interface HomeScreenProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'dessert', label: 'Desserts', emoji: '🍰' },
  { id: 'snack', label: 'Munchies', emoji: '🍿' },
  { id: 'indian', label: 'Indian', emoji: '🍛' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
];

const getStems = (word: string): string[] => {
  const stems = [word];
  if (word.endsWith('s') && word.length > 3) {
    stems.push(word.slice(0, -1)); // "burgers" -> "burger"
  } else if (word.length > 3 && !word.endsWith('s')) {
    stems.push(word + 's'); // "burger" -> "burgers"
  }
  return stems;
};

const SearchItemRow: React.FC<{
  item: any;
  restaurantId: string;
  restaurantName: string;
  quantityInCart: number;
  onAdd: () => void;
  onRemove: () => void;
  currency: any;
}> = ({ item, restaurantName, quantityInCart, onAdd, onRemove, currency }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loadingUrl, setLoadingUrl] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      setLoadingUrl(true);
      try {
        const url = await imageGenerator.getMenuItemImage(item.id, item.name, restaurantName);
        if (isMounted) {
          setImageUrl(url);
          setLoadingUrl(false);
        }
      } catch (err) {
        if (isMounted) {
          setImageUrl(imageGenerator.getFallbackImage(item.image_keyword, item.id));
          setLoadingUrl(false);
        }
      }
    };
    fetchImage();
    return () => { isMounted = false; };
  }, [item.id, item.name, restaurantName]);

  return (
    <div className="bg-darkcard rounded-2xl p-3 flex gap-3.5 border border-slate-800/20 shadow-card-elevation hover:border-slate-700/40 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800/60">
        {(!imageLoaded || loadingUrl) && (
          <div className="absolute inset-0 shimmer-bg z-10" />
        )}
        {!loadingUrl && imageUrl && (
          <img
            src={imageUrl}
            alt={item.name}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imageGenerator.getFallbackImage(item.image_keyword, item.id);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          <div className="flex justify-between items-start gap-1">
            <h4 className="text-xs font-black text-slate-100 truncate">{item.name}</h4>
            <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/10 truncate max-w-[120px]">
              at {restaurantName.split(' ')[0]}
            </span>
          </div>
          <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">
            {item.description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs font-black text-slate-200">
            {formatCurrency(item.price, currency)}
          </span>

          {quantityInCart > 0 ? (
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-0.5">
              <button
                onClick={onRemove}
                className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Minus size={10} />
              </button>
              <span className="text-[10px] font-bold text-slate-200 w-4 text-center">
                {quantityInCart}
              </span>
              <button
                onClick={onAdd}
                className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Plus size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-0.5 shadow-glass transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={10} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectRestaurant }) => {
  const { user, savings, settings, cart, addToCart, removeFromCart, updateQuantity } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically select menu based on selected currency
  const getRestaurants = (): Restaurant[] => {
    const activeCurrency = settings?.currency || 'INR';
    switch (activeCurrency) {
      case 'USD': return menuUsData as Restaurant[];
      case 'GBP': return menuUkData as Restaurant[];
      case 'INR':
      default: return menuInData as Restaurant[];
    }
  };

  const baseRestaurants = getRestaurants();

  // Inject active simulationCity into restaurant names dynamically!
  const restaurants: Restaurant[] = baseRestaurants.map(r => ({
    ...r,
    name: `${r.name} (${(settings?.simulationCity || 'Bengaluru').split(',')[0]})` // Show city name
  }));

  // Flatten all menu items for the Direct Cravings search
  interface FlatMenuItem {
    item: any;
    restaurantId: string;
    restaurantName: string;
  }

  const allMenuItems: FlatMenuItem[] = [];
  restaurants.forEach((r) => {
    r.menu.forEach((item) => {
      allMenuItems.push({
        item,
        restaurantId: r.id,
        restaurantName: r.name,
      });
    });
  });

  const handleCategorySelect = (categoryId: string) => {
    haptics.lightTap();
    setSelectedCategory(categoryId);
  };

  // Filter restaurants matching category and search query
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      r.name.toLowerCase().includes(selectedCategory.toLowerCase());

    const queryWords = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matchesSearch = queryWords.length === 0 || queryWords.every((word) => {
      const stems = getStems(word);
      const nameWords = r.name.toLowerCase().split(/[\s&.,()]+/);
      const cuisineWords = r.cuisine.toLowerCase().split(/[\s•/]+/);
      
      const nameMatch = nameWords.some((w) => stems.some((stem) => w === stem || w.startsWith(stem)));
      const cuisineMatch = cuisineWords.some((w) => stems.some((stem) => w === stem || w.startsWith(stem)));
      const itemsMatch = r.menu.some((item) => {
        const itemLower = item.name.toLowerCase();
        const descLower = item.description.toLowerCase();
        return stems.some((stem) => itemLower.includes(stem) || descLower.includes(stem));
      });

      return nameMatch || cuisineMatch || itemsMatch;
    });

    return matchesCategory && matchesSearch;
  });

  // 1. Filter Direct Cravings matching Category (if not 'all')
  let categoryFilteredItems = allMenuItems;
  if (selectedCategory !== 'all') {
    categoryFilteredItems = allMenuItems.filter((flatItem) => {
      const parentRestaurant = restaurants.find(r => r.id === flatItem.restaurantId);
      if (!parentRestaurant) return false;
      return parentRestaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());
    });
  }

  // 2. Filter Direct Cravings matching Search Query
  let filteredItems = categoryFilteredItems;
  const queryWords = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (queryWords.length > 0) {
    filteredItems = categoryFilteredItems.filter((flatItem) => {
      const parentRestaurant = restaurants.find(r => r.id === flatItem.restaurantId);
      const cuisineLower = parentRestaurant ? parentRestaurant.cuisine.toLowerCase() : '';

      return queryWords.every((word) => {
        const stems = getStems(word);
        const nameLower = flatItem.item.name.toLowerCase();
        const descLower = flatItem.item.description.toLowerCase();
        const restLower = flatItem.restaurantName.toLowerCase();
        
        return stems.some((stem) => 
          nameLower.includes(stem) || 
          descLower.includes(stem) || 
          restLower.includes(stem) ||
          cuisineLower.includes(stem)
        );
      });
    });
  }

  const getQuantity = (itemId: string, restaurantId: string) => {
    if (!cart || cart.restaurantId !== restaurantId) return 0;
    return cart.items.find((i) => i.menuItem.id === itemId)?.quantity || 0;
  };

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
                {formatCurrency(savings, settings.currency)}
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

      {/* Categories Horizontal Scroll (Always Visible!) */}
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

      {/* Conditional Direct Food Items Feed OR Normal Restaurants List */}
      {(selectedCategory !== 'all' || searchQuery.trim().length > 0) ? (
        <div className="px-6 py-2 space-y-6">
          {/* Direct Cravings Section */}
          {filteredItems.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                🍔 Direct Cravings ({filteredItems.length})
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {filteredItems.map(({ item, restaurantId, restaurantName }) => {
                  const qty = getQuantity(item.id, restaurantId);
                  return (
                    <SearchItemRow
                      key={item.id}
                      item={item}
                      restaurantId={restaurantId}
                      restaurantName={restaurantName}
                      quantityInCart={qty}
                      onAdd={() => {
                        haptics.mediumTap();
                        addToCart(restaurantId, restaurantName, item);
                      }}
                      onRemove={() => {
                        haptics.lightTap();
                        if (qty === 1) {
                          removeFromCart(item.id);
                        } else {
                          updateQuantity(item.id, -1);
                        }
                      }}
                      currency={settings.currency}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Restaurants Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              🏪 Matching Restaurants ({filteredRestaurants.length})
            </h3>
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
              <div className="text-center py-8 glass-panel rounded-2xl border-dashed border-slate-800">
                <p className="text-xs text-slate-500 italic">No matching restaurants found.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Default view: Just list all open restaurants */
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

          <div className="grid grid-cols-1 gap-5">
            {filteredRestaurants.map((rest) => (
              <RestaurantCard
                key={rest.id}
                restaurant={rest}
                onClick={() => onSelectRestaurant(rest)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default HomeScreen;

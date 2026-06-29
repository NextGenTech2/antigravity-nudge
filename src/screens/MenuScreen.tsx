import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, ShoppingBag, Plus, Minus } from 'lucide-react';
import type { Restaurant, MenuItem } from '../types/restaurant';
import { useAppStore } from '../store/useAppStore';
import { imageGenerator } from '../services/imageGenerator';
import { haptics } from '../services/haptics';

interface MenuScreenProps {
  restaurant: Restaurant;
  onBack: () => void;
}

// Sub-component to handle async AI image generation for each menu item
const MenuItemRow: React.FC<{
  item: MenuItem;
  restaurantName: string;
  quantityInCart: number;
  onAdd: () => void;
  onRemove: () => void;
}> = ({ item, restaurantName, quantityInCart, onAdd, onRemove }) => {
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
        console.error('Error generating menu item image', err);
        if (isMounted) {
          setImageUrl(imageGenerator.getFallbackImage(item.image_keyword, item.id));
          setLoadingUrl(false);
        }
      }
    };

    fetchImage();
    return () => {
      isMounted = false;
    };
  }, [item.id, item.name, restaurantName]);

  return (
    <div className="bg-darkcard rounded-2xl p-4 flex gap-4 border border-slate-800/20 shadow-card-elevation hover:border-slate-700/40 transition-all duration-300">
      {/* AI Food Image with Shimmer Loading */}
      <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800/60">
        {(!imageLoaded || loadingUrl) && (
          <div className="absolute inset-0 shimmer-bg z-10" />
        )}
        {!loadingUrl && imageUrl && (
          <img
            src={imageUrl}
            alt={item.name}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
              e.currentTarget.src = imageGenerator.getFallbackImage(item.image_keyword, item.id);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover text-transparent transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
          <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-sm font-extrabold text-indigo-400">₹{item.price}</span>

          {/* Cart Buttons */}
          {quantityInCart > 0 ? (
            <div className="flex items-center gap-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-1">
              <button
                onClick={onRemove}
                className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-bold text-slate-200 w-4 text-center">
                {quantityInCart}
              </span>
              <button
                onClick={onAdd}
                className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-glass transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const MenuScreen: React.FC<MenuScreenProps> = ({ restaurant, onBack }) => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useAppStore();

  const handleBackClick = () => {
    haptics.lightTap();
    onBack();
  };

  const handleAddItem = (item: MenuItem) => {
    haptics.mediumTap();
    addToCart(restaurant.id, restaurant.name, item);
  };

  const handleRemoveItem = (item: MenuItem) => {
    haptics.lightTap();
    const cartItem = cart?.items.find((i) => i.menuItem.id === item.id);
    if (cartItem) {
      if (cartItem.quantity === 1) {
        removeFromCart(item.id);
      } else {
        updateQuantity(item.id, -1);
      }
    }
  };

  const getQuantity = (itemId: string) => {
    if (!cart || cart.restaurantId !== restaurant.id) return 0;
    return cart.items.find((i) => i.menuItem.id === itemId)?.quantity || 0;
  };

  const headerImageUrl = imageGenerator.getRestaurantHeaderImage(
    restaurant.id,
    restaurant.name,
    restaurant.cuisine
  );

  return (
    <div className="w-full h-full flex flex-col bg-darkbg pb-52 overflow-y-auto">
      {/* Cover Image & Back Button Header */}
      <div className="relative h-56 w-full shrink-0 bg-slate-950">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-darkbg to-transparent z-10" />
        <img
          src={headerImageUrl}
          alt={restaurant.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = imageGenerator.getFallbackImage(restaurant.image_keyword, restaurant.id);
          }}
          className="w-full h-full object-cover"
        />

        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-5 z-20 p-2.5 bg-slate-950/60 backdrop-blur-md rounded-full border border-slate-800 text-slate-100 hover:bg-slate-900/80 transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Floating Badges */}
        <div className="absolute bottom-4 left-6 right-6 z-20 space-y-1">
          <h1 className="text-2xl font-black text-slate-100 drop-shadow-md">
            {restaurant.name}
          </h1>
          <p className="text-xs text-slate-300 font-medium drop-shadow-sm">
            {restaurant.cuisine}
          </p>
        </div>
      </div>

      {/* Restaurant Stats Row */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-1.5 bg-slate-900/80 py-1.5 px-3 rounded-xl border border-slate-800">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-slate-200">{restaurant.rating} Rating</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 py-1.5 px-3 rounded-xl border border-slate-800">
          <Clock size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">{restaurant.deliveryTime} mins</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 py-1.5 px-3 rounded-xl border border-slate-800">
          <ShoppingBag size={14} className="text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">₹{restaurant.deliveryFee} fee</span>
        </div>
      </div>

      {/* Menu Header */}
      <div className="p-6 pb-2">
        <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider">
          Menu Items
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Select items. You won't pay a single rupee. All costs go straight to your savings.
        </p>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-52 space-y-4">
        {restaurant.menu.map((item) => (
          <MenuItemRow
            key={item.id}
            item={item}
            restaurantName={restaurant.name}
            quantityInCart={getQuantity(item.id)}
            onAdd={() => handleAddItem(item)}
            onRemove={() => handleRemoveItem(item)}
          />
        ))}
      </div>
    </div>
  );
};
export default MenuScreen;

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, ShoppingBag } from 'lucide-react';
import type { Restaurant } from '../types/restaurant';
import { imageGenerator } from '../services/imageGenerator';
import { haptics } from '../services/haptics';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const imageUrl = imageGenerator.getRestaurantHeaderImage(
    restaurant.id,
    restaurant.name,
    restaurant.cuisine
  );

  const handleCardClick = () => {
    haptics.lightTap();
    onClick();
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-darkcard rounded-2xl overflow-hidden cursor-pointer shadow-card-elevation border border-slate-800/20 flex flex-col h-72 group transition-all duration-300"
    >
      {/* Restaurant Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-darkcard to-transparent z-10" />
        
        {/* Shimmer Placeholder while AI generates the image */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer-bg z-0" />
        )}

        <img
          src={imageUrl}
          alt={restaurant.name}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.onerror = null; // Prevent infinite loop
            e.currentTarget.src = imageGenerator.getFallbackImage(restaurant.image_keyword, restaurant.id);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 text-transparent ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
        
        {/* Cuisine Tag */}
        <span className="absolute top-3 left-3 z-20 bg-slate-900/80 backdrop-blur-md text-slate-200 text-xs px-2.5 py-1 rounded-lg font-medium border border-slate-700/30">
          {restaurant.cuisine.split('•')[0].trim()}
        </span>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-700/50 shadow-lg">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-slate-200 text-xs font-semibold">{restaurant.rating}</span>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-transparent">
        <div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-400 transition-colors duration-200 line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
            {restaurant.cuisine}
          </p>
        </div>

        {/* Metadata row */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-1.5 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <Clock size={13} className="text-indigo-400" />
            <span>{restaurant.deliveryTime} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingBag size={13} className="text-emerald-400" />
            <span>₹{restaurant.deliveryFee} delivery</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default RestaurantCard;

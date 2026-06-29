import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, X, ChevronUp, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { haptics } from '../services/haptics';

interface CartOverlayProps {
  onCheckout: () => void;
}

export const CartOverlay: React.FC<CartOverlayProps> = ({ onCheckout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { cart, removeFromCart, updateQuantity } = useAppStore();

  if (!cart || cart.items.length === 0) return null;

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const foodTotal = cart.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = 40; // Flat mock delivery fee
  const orderTotal = foodTotal + deliveryFee;

  const handleToggle = () => {
    haptics.lightTap();
    setIsExpanded(!isExpanded);
  };

  const handleQtyChange = (itemId: string, change: number) => {
    haptics.lightTap();
    updateQuantity(itemId, change);
  };

  const handleRemove = (itemId: string) => {
    haptics.warningNotification();
    removeFromCart(itemId);
  };

  const handleCheckoutClick = () => {
    haptics.successNotification();
    setIsExpanded(false);
    onCheckout();
  };

  return (
    <>
      {/* Backdrop overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleToggle}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <AnimatePresence initial={false}>
          {!isExpanded ? (
            // Collapsed Floating Cart Bar
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={handleToggle}
              className="glass-panel rounded-xl py-3.5 px-4 flex justify-between items-center shadow-accent-glow border-indigo-500/30 cursor-pointer hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <ShoppingCart size={18} />
                  <span className="absolute -top-1.5 -right-1.5 bg-accent-pink text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Viewing cart from</p>
                  <p className="text-sm font-bold text-slate-200 line-clamp-1">{cart.restaurantName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-200">₹{orderTotal}</span>
                <ChevronUp size={16} className="text-slate-400 animate-bounce" />
              </div>
            </motion.div>
          ) : (
            // Expanded Bottom Sheet Drawer
            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="glass-panel bg-darkcard rounded-t-2xl border-t border-slate-800 shadow-glass w-full flex flex-col max-h-[70vh] absolute bottom-[-24px] left-0 right-0"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-indigo-400" />
                  <h3 className="font-semibold text-slate-200">Your Cart</h3>
                </div>
                <button
                  onClick={handleToggle}
                  className="p-1.5 hover:bg-slate-800/60 rounded-full text-slate-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[40vh]">
                {cart.items.map((item) => (
                  <div key={item.menuItem.id} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{item.menuItem.name}</h4>
                      <p className="text-xs text-indigo-400 font-bold mt-0.5">₹{item.menuItem.price}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-lg p-1">
                      <button
                        onClick={() => handleQtyChange(item.menuItem.id, -1)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold text-slate-300 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.menuItem.id, 1)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.menuItem.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bill Details & Savings Pitch */}
              <div className="p-4 bg-slate-900/40 border-t border-slate-800 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{foodTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simulated Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold border-t border-slate-800/60 pt-1.5">
                    <span>Redirected to Savings</span>
                    <span>₹{orderTotal}</span>
                  </div>
                </div>

                {/* Simulated Order Button */}
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-accent-glow transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>Place Order & Save ₹{orderTotal}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
export default CartOverlay;

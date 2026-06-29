import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '../types/restaurant';

export interface CravingLog {
  id: string;
  timestamp: number;
  restaurantName: string;
  items: { name: string; quantity: number; price: number }[];
  amountSaved: number;
  trigger: 'Boredom' | 'Stress' | 'Tiredness' | 'Loneliness' | 'Habit' | 'Social' | 'Other';
  notes: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface Cart {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
}

interface AppSettings {
  openaiApiKey: string;
  hapticsEnabled: boolean;
  fastModeEnabled: boolean;
}

export type DeliveryStageType = 'IDLE' | 'PREPARING' | 'PACKING' | 'RIDER_ASSIGNED' | 'EN_ROUTE' | 'DELIVERED';

interface ActiveOrder {
  restaurantId: string;
  restaurantName: string;
  cuisine: string;
  totalSaved: number;
  items: { name: string; quantity: number; price: number }[];
}

interface AppState {
  user: UserProfile | null;
  cart: Cart | null;
  savings: number;
  history: CravingLog[];
  settings: AppSettings;
  
  // Delivery State Machine
  deliveryStage: DeliveryStageType;
  deliveryStartTime: number | null;
  activeOrder: ActiveOrder | null;
  
  // Auth Actions
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  
  // Cart Actions
  addToCart: (restaurantId: string, restaurantName: string, item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, change: number) => void;
  clearCart: () => void;
  
  // Savings & Logging Actions
  addSavings: (amount: number) => void;
  startDelivery: (
    restaurantId: string,
    restaurantName: string,
    cuisine: string,
    totalSaved: number,
    items: { name: string; quantity: number; price: number }[]
  ) => void;
  setDeliveryStage: (stage: DeliveryStageType) => void;
  completeDelivery: (trigger: CravingLog['trigger'], notes: string) => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetAllData: () => void;
}

const initialSettings: AppSettings = {
  openaiApiKey: '',
  hapticsEnabled: true,
  fastModeEnabled: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      cart: null,
      savings: 0,
      history: [],
      settings: initialSettings,
      
      deliveryStage: 'IDLE',
      deliveryStartTime: null,
      activeOrder: null,

      setUser: (user) => set({ user }),
      logout: () => set({ user: null, cart: null, deliveryStage: 'IDLE', deliveryStartTime: null, activeOrder: null }),

      addToCart: (restaurantId, restaurantName, item) => set((state) => {
        const currentCart = state.cart;
        if (currentCart && currentCart.restaurantId !== restaurantId) {
          return {
            cart: {
              restaurantId,
              restaurantName,
              items: [{ menuItem: item, quantity: 1 }],
            },
          };
        }

        const existingItems = currentCart ? [...currentCart.items] : [];
        const itemIndex = existingItems.findIndex((i) => i.menuItem.id === item.id);

        if (itemIndex > -1) {
          existingItems[itemIndex].quantity += 1;
        } else {
          existingItems.push({ menuItem: item, quantity: 1 });
        }

        return {
          cart: {
            restaurantId,
            restaurantName,
            items: existingItems,
          },
        };
      }),

      removeFromCart: (itemId) => set((state) => {
        if (!state.cart) return {};
        const updatedItems = state.cart.items.filter((i) => i.menuItem.id !== itemId);
        if (updatedItems.length === 0) {
          return { cart: null };
        }
        return {
          cart: {
            ...state.cart,
            items: updatedItems,
          },
        };
      }),

      updateQuantity: (itemId, change) => set((state) => {
        if (!state.cart) return {};
        const updatedItems = state.cart.items
          .map((i) => {
            if (i.menuItem.id === itemId) {
              return { ...i, quantity: Math.max(1, i.quantity + change) };
            }
            return i;
          });
        
        return {
          cart: {
            ...state.cart,
            items: updatedItems,
          },
        };
      }),

      clearCart: () => set({ cart: null }),

      addSavings: (amount) => set((state) => ({ savings: state.savings + amount })),

      startDelivery: (restaurantId, restaurantName, cuisine, totalSaved, items) => set({
        deliveryStage: 'PREPARING',
        deliveryStartTime: Date.now(),
        activeOrder: {
          restaurantId,
          restaurantName,
          cuisine,
          totalSaved,
          items,
        },
        cart: null, // Clear cart once delivery starts
      }),

      setDeliveryStage: (stage) => set({ deliveryStage: stage }),

      completeDelivery: (trigger, notes) => set((state) => {
        const order = state.activeOrder;
        if (!order) return {};

        const newLog: CravingLog = {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          restaurantName: order.restaurantName,
          items: order.items,
          amountSaved: order.totalSaved,
          trigger,
          notes,
        };

        return {
          savings: state.savings + order.totalSaved,
          history: [newLog, ...state.history],
          deliveryStage: 'IDLE',
          deliveryStartTime: null,
          activeOrder: null,
        };
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

      resetAllData: () => set({
        cart: null,
        savings: 0,
        history: [],
        settings: initialSettings,
        deliveryStage: 'IDLE',
        deliveryStartTime: null,
        activeOrder: null,
      }),
    }),
    {
      name: 'anti-cravings-storage',
    }
  )
);

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
  goalId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  emoji: string;
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
  currency: 'INR' | 'USD' | 'GBP';
  simulationCity: string;
  customCoords: [number, number] | null;
}

export type DeliveryStageType = 'IDLE' | 'PREPARING' | 'PACKING' | 'RIDER_ASSIGNED' | 'EN_ROUTE' | 'DELIVERED';

interface ActiveOrder {
  restaurantId: string;
  restaurantName: string;
  cuisine: string;
  totalSaved: number;
  items: { name: string; quantity: number; price: number }[];
  trigger?: CravingLog['trigger'] | null;
}

interface AppState {
  user: UserProfile | null;
  cart: Cart | null;
  savings: number;
  history: CravingLog[];
  settings: AppSettings;
  
  // Goals State
  goals: SavingsGoal[];
  activeGoalId: string;
  
  // Global Intercept State (Full-screen immersion)
  globalIntercept: 'NONE' | 'BREATHE' | 'GAME';
  
  // Delivery State Machine
  deliveryStage: DeliveryStageType;
  deliveryStartTime: number | null;
  activeOrder: ActiveOrder | null;
  currentTickingSavings: number;
  
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
  setCurrentTickingSavings: (amount: number) => void;
  setActiveOrderTrigger: (trigger: CravingLog['trigger']) => void;
  completeDelivery: (trigger: CravingLog['trigger'], notes: string) => void;
  
  // Goals Actions
  setActiveGoalId: (goalId: string) => void;
  allocateSavingsToGoal: (goalId: string, amount: number) => void;
  
  // Global Intercept Actions
  startGlobalIntercept: (type: 'BREATHE' | 'GAME') => void;
  stopGlobalIntercept: () => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetAllData: () => void;
}

const initialSettings: AppSettings = {
  openaiApiKey: '',
  hapticsEnabled: true,
  fastModeEnabled: false,
  currency: 'INR',
  simulationCity: 'Bengaluru',
  customCoords: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      cart: null,
      savings: 0,
      history: [],
      settings: initialSettings,
      
      // Goals Initial State
      goals: [
        { id: 'phuket', name: 'Phi Phi Islands Trip', target: 45000, saved: 0, emoji: '🌴' },
        { id: 'zerodha', name: 'Zerodha Equity Portfolio', target: 100000, saved: 0, emoji: '📈' },
        { id: 'tech', name: 'Tech Upgrade Fund', target: 80000, saved: 0, emoji: '💻' },
      ],
      activeGoalId: 'phuket',
      
      globalIntercept: 'NONE',
      
      deliveryStage: 'IDLE',
      deliveryStartTime: null,
      activeOrder: null,
      currentTickingSavings: 0,

      setUser: (user) => set({ user }),
      logout: () => set({ user: null, cart: null, deliveryStage: 'IDLE', deliveryStartTime: null, activeOrder: null, currentTickingSavings: 0 }),
      
      // ... (cart actions) ...
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
        currentTickingSavings: 0,
        activeOrder: {
          restaurantId,
          restaurantName,
          cuisine,
          totalSaved,
          items,
          trigger: null,
        },
        cart: null, // Clear cart once delivery starts
      }),

      setDeliveryStage: (stage) => set({ deliveryStage: stage }),

      setCurrentTickingSavings: (amount) => set({ currentTickingSavings: amount }),

      setActiveOrderTrigger: (trigger) => set((state) => {
        if (!state.activeOrder) return {};
        return {
          activeOrder: {
            ...state.activeOrder,
            trigger,
          },
        };
      }),

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
          goalId: state.activeGoalId,
        };

        const updatedGoals = state.goals.map((g) => {
          if (g.id === state.activeGoalId) {
            return { ...g, saved: g.saved + order.totalSaved };
          }
          return g;
        });

        return {
          savings: state.savings + order.totalSaved,
          history: [newLog, ...state.history],
          goals: updatedGoals,
          deliveryStage: 'IDLE',
          deliveryStartTime: null,
          activeOrder: null,
          currentTickingSavings: 0,
        };
      }),

      setActiveGoalId: (goalId) => set({ activeGoalId: goalId }),
      
      allocateSavingsToGoal: (goalId, amount) => set((state) => {
        const updatedGoals = state.goals.map((g) => {
          if (g.id === goalId) {
            return { ...g, saved: g.saved + amount };
          }
          return g;
        });
        return { goals: updatedGoals };
      }),

      startGlobalIntercept: (type) => set({ globalIntercept: type }),
      
      stopGlobalIntercept: () => set({ globalIntercept: 'NONE' }),

      updateSettings: (newSettings) => set((state) => {
        const updatedSettings = { ...state.settings, ...newSettings };
        const result: Partial<AppState> = { settings: updatedSettings };

        // If currency changed, adjust default goals target scales and default simulationCity
        if (newSettings.currency && newSettings.currency !== state.settings.currency) {
          const isINR = newSettings.currency === 'INR';
          result.goals = isINR
            ? [
                { id: 'phuket', name: 'Phi Phi Islands Trip', target: 45000, saved: 0, emoji: '🌴' },
                { id: 'zerodha', name: 'Zerodha Equity Portfolio', target: 100000, saved: 0, emoji: '📈' },
                { id: 'tech', name: 'Tech Upgrade Fund', target: 80000, saved: 0, emoji: '💻' },
              ]
            : [
                { id: 'trip', name: 'Tropical Vacation Trip', target: 600, saved: 0, emoji: '🌴' },
                { id: 'stocks', name: 'Stock Market Portfolio', target: 1500, saved: 0, emoji: '📈' },
                { id: 'tech', name: 'Tech Upgrade Fund', target: 1000, saved: 0, emoji: '💻' },
              ];
          result.activeGoalId = isINR ? 'phuket' : 'trip';
          result.savings = 0; // reset savings to align with new currency scale
          result.history = []; // clear history to align with new currency scale

          // Also set default simulationCity based on currency if customCoords is not set
          if (!updatedSettings.customCoords) {
            updatedSettings.simulationCity = newSettings.currency === 'USD' 
              ? 'New York' 
              : newSettings.currency === 'GBP' 
              ? 'London' 
              : 'Bengaluru';
          }
        }
        
        return result;
      }),

      resetAllData: () => set((state) => {
        const isINR = state.settings.currency === 'INR';
        const defaultGoals = isINR
          ? [
              { id: 'phuket', name: 'Phi Phi Islands Trip', target: 45000, saved: 0, emoji: '🌴' },
              { id: 'zerodha', name: 'Zerodha Equity Portfolio', target: 100000, saved: 0, emoji: '📈' },
              { id: 'tech', name: 'Tech Upgrade Fund', target: 80000, saved: 0, emoji: '💻' },
            ]
          : [
              { id: 'trip', name: 'Tropical Vacation Trip', target: 600, saved: 0, emoji: '🌴' },
              { id: 'stocks', name: 'Stock Market Portfolio', target: 1500, saved: 0, emoji: '📈' },
              { id: 'tech', name: 'Tech Upgrade Fund', target: 1000, saved: 0, emoji: '💻' },
            ];
        return {
          cart: null,
          savings: 0,
          history: [],
          goals: defaultGoals,
          activeGoalId: isINR ? 'phuket' : 'trip',
          globalIntercept: 'NONE',
          settings: initialSettings,
          deliveryStage: 'IDLE',
          deliveryStartTime: null,
          activeOrder: null,
          currentTickingSavings: 0,
        };
      }),
    }),
    {
      name: 'anti-cravings-storage',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as any;
        return {
          ...currentState,
          ...persisted,
          settings: {
            ...currentState.settings,
            ...(persisted?.settings || {}),
          },
        };
      },
    }
  )
);

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type CravingLog } from './store/useAppStore';
import { auth } from './services/firebase';
import { haptics } from './services/haptics';
import type { Restaurant } from './types/restaurant';

// Screens
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MenuScreen } from './screens/MenuScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ActiveOrderScreen } from './screens/ActiveOrderScreen';

// Components
import { BottomNavigation } from './components/BottomNavigation';
import type { ScreenType } from './components/BottomNavigation';
import { CartOverlay } from './components/CartOverlay';
import { CravingsLogModal } from './components/CravingsLogModal';
import restaurantsData from './data/restaurants.json';

interface AppHistoryState {
  screen: ScreenType;
  restaurantId: string | null;
  cartExpanded: boolean;
}

// Helper functions for stage timings
const getStageDurations = (fastMode: boolean) => {
  const scale = fastMode ? 1000 : 60000; // 1s vs 1m
  return {
    PREPARING: 5 * scale,
    PACKING: 2 * scale,
    RIDER_ASSIGNED: 2 * scale,
    EN_ROUTE: 15 * scale,
  };
};

const getStageTransitions = (fastMode: boolean) => {
  const dur = getStageDurations(fastMode);
  const prepEnd = dur.PREPARING;
  const packEnd = prepEnd + dur.PACKING;
  const riderEnd = packEnd + dur.RIDER_ASSIGNED;
  const routeEnd = riderEnd + dur.EN_ROUTE;
  return {
    prepEnd,
    packEnd,
    riderEnd,
    routeEnd,
    total: routeEnd,
  };
};

export const App: React.FC = () => {
  const { 
    user, 
    setUser, 
    cart, 
    settings,
    deliveryStage, 
    deliveryStartTime, 
    activeOrder,
    startDelivery,
    setDeliveryStage,
    completeDelivery 
  } = useAppStore();
  
  const [activeScreen, setActiveScreen] = useState<ScreenType>('browse');
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  
  // Simulation Live States
  const [stageProgress, setStageProgress] = useState(0);
  const [eta, setEta] = useState(25);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  
  const [lastOrderDetails, setLastOrderDetails] = useState<{
    restaurantName: string;
    amountSaved: number;
    trigger?: CravingLog['trigger'] | null;
  } | null>(null);

  const isFirstMount = React.useRef(true);

  // 5-second Idle Bounce Timer
  useEffect(() => {
    if (deliveryStage === 'IDLE' || activeScreen === 'browse') {
      setShouldBounce(false);
      return;
    }

    setShouldBounce(false);
    const timer = setTimeout(() => {
      setShouldBounce(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeScreen, deliveryStage]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isGuest: false,
          });
        } else {
          const currentUser = useAppStore.getState().user;
          if (currentUser && !currentUser.isGuest) {
            setUser(null);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [setUser]);

  // --- Native Back Button & Browser History Sync ---
  useEffect(() => {
    // Initialize history state on mount
    const initialState: AppHistoryState = {
      screen: 'browse',
      restaurantId: null,
      cartExpanded: false,
    };
    window.history.replaceState(initialState, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as AppHistoryState;
      if (state) {
        // Update React states from popped history state
        setActiveScreen(state.screen);
        setIsCartExpanded(state.cartExpanded);
        
        if (state.restaurantId) {
          const found = restaurantsData.find((r) => r.id === state.restaurantId);
          setActiveRestaurant(found as Restaurant || null);
        } else {
          setActiveRestaurant(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize React state changes to browser history
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const currentHistoryState = window.history.state as AppHistoryState;
    const matches = currentHistoryState &&
                    currentHistoryState.screen === activeScreen &&
                    currentHistoryState.restaurantId === (activeRestaurant ? activeRestaurant.id : null) &&
                    currentHistoryState.cartExpanded === isCartExpanded;

    if (!matches) {
      const newState: AppHistoryState = {
        screen: activeScreen,
        restaurantId: activeRestaurant ? activeRestaurant.id : null,
        cartExpanded: isCartExpanded,
      };
      window.history.pushState(newState, '');
    }
  }, [activeScreen, activeRestaurant, isCartExpanded]);

  // Background-safe Timer Orchestration
  useEffect(() => {
    if (deliveryStage === 'IDLE' || !deliveryStartTime || !activeOrder) {
      return;
    }

    const { prepEnd, packEnd, riderEnd, routeEnd, total } = getStageTransitions(settings.fastModeEnabled);
    
    const tick = () => {
      const elapsed = Date.now() - deliveryStartTime;
      let newStage = deliveryStage;
      let prog = 0;

      if (elapsed < prepEnd) {
        newStage = 'PREPARING';
        prog = elapsed / prepEnd;
      } else if (elapsed < packEnd) {
        newStage = 'PACKING';
        prog = (elapsed - prepEnd) / (packEnd - prepEnd);
      } else if (elapsed < riderEnd) {
        newStage = 'RIDER_ASSIGNED';
        prog = (elapsed - packEnd) / (riderEnd - packEnd);
      } else if (elapsed < routeEnd) {
        newStage = 'EN_ROUTE';
        prog = (elapsed - riderEnd) / (routeEnd - riderEnd);
      } else {
        newStage = 'DELIVERED';
        prog = 1;
      }

      // Update ETA
      const timeScale = settings.fastModeEnabled ? 1000 : 60000;
      const remainingTime = Math.max(0, Math.ceil((total - elapsed) / timeScale));
      setEta(remainingTime);

      // Update stage-specific progress
      setStageProgress(prog);

      // Update continuous savings counter
      const savingsFraction = Math.min(1, elapsed / total);
      setCurrentSavings(Math.floor(activeOrder.totalSaved * savingsFraction));

      // Handle stage transitions
      if (newStage !== deliveryStage) {
        setDeliveryStage(newStage);
        
        if (newStage === 'DELIVERED') {
          haptics.successNotification();
          setLastOrderDetails({
            restaurantName: activeOrder.restaurantName,
            amountSaved: activeOrder.totalSaved,
            trigger: activeOrder.trigger,
          });
          setIsLogModalOpen(true);
        } else {
          haptics.lightTap();
        }
      }
    };

    // Run immediately and then on a 200ms interval for smooth rendering
    tick();
    const intervalId = setInterval(tick, 200);

    return () => clearInterval(intervalId);
  }, [deliveryStage, deliveryStartTime, activeOrder, settings.fastModeEnabled, setDeliveryStage]);

  // Restores log modal if the user reopens the tab and the order is already DELIVERED
  useEffect(() => {
    if (deliveryStage === 'DELIVERED' && activeOrder && !isLogModalOpen) {
      setLastOrderDetails({
        restaurantName: activeOrder.restaurantName,
        amountSaved: activeOrder.totalSaved,
        trigger: activeOrder.trigger,
      });
      setIsLogModalOpen(true);
    }
  }, [deliveryStage, activeOrder, isLogModalOpen]);

  // Transition from Menu/Cart to the simulated Map Tracking Screen
  const handleCheckout = () => {
    if (!cart) return;
    
    const foodTotal = cart.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const deliveryFee = 40;
    const totalSaved = foodTotal + deliveryFee;
    
    const itemsList = cart.items.map((i) => ({
      name: i.menuItem.name,
      quantity: i.quantity,
      price: i.menuItem.price,
    }));

    // Start the delivery state machine!
    haptics.successNotification();
    startDelivery(
      cart.restaurantId,
      cart.restaurantName,
      activeRestaurant?.cuisine || 'Gourmet Cuisine',
      totalSaved,
      itemsList
    );
  };

  // Log the craving trigger and redirect to the Dashboard
  const handleLogSave = (trigger: any, notes: string) => {
    completeDelivery(trigger, notes); // This updates total savings, logs the entry, and clears activeOrder in Zustand
    setIsLogModalOpen(false);
    setActiveRestaurant(null); // Clear active restaurant selection
    setActiveScreen('dashboard'); // Redirect to dashboard to see savings and charts
  };

  // Render the un-authenticated onboarding flow
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="w-full h-full flex flex-col relative bg-darkbg">
      {/* Active Order Mini-Bar (sticky floating banner visible on Dashboard and Settings) */}
      <AnimatePresence>
        {deliveryStage !== 'IDLE' && activeOrder && activeScreen !== 'browse' && (
          <motion.div
            layoutId="activeOrderContainer"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            onClick={() => {
              haptics.lightTap();
              setActiveScreen('browse');
            }}
            className="fixed top-6 left-4 right-4 mx-auto max-w-md z-50 cursor-pointer"
          >
            {/* Inner motion.div handles the local glow and idle bounce animations */}
            <motion.div
              animate={shouldBounce ? {
                y: [0, -6, 0, -3, 0],
                boxShadow: [
                  "0 0 15px rgba(99, 102, 241, 0.25)",
                  "0 0 30px rgba(99, 102, 241, 0.55)",
                  "0 0 15px rgba(99, 102, 241, 0.25)"
                ]
              } : {
                y: 0,
                boxShadow: [
                  "0 0 15px rgba(99, 102, 241, 0.2)",
                  "0 0 25px rgba(99, 102, 241, 0.4)",
                  "0 0 15px rgba(99, 102, 241, 0.2)"
                ]
              }}
              transition={{
                y: shouldBounce ? {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 3.5,
                  ease: "easeInOut"
                } : { duration: 0.2 },
                boxShadow: {
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="glass-panel rounded-full py-2.5 px-5 flex items-center justify-between border-indigo-500/30 bg-darkcard/95 backdrop-blur-md overflow-hidden relative"
            >
              {/* Dynamic Progress-Fill Background */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-indigo-500/15 rounded-full -z-10 transition-all duration-500 ease-out"
                style={{ width: `${(currentSavings / activeOrder.totalSaved) * 100}%` }}
              />

              <div className="flex items-center gap-3.5">
                <span className="text-2xl animate-bounce leading-none">🚴</span>
                <div className="text-left flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                    Tracking: ₹{currentSavings} Saved
                  </span>
                  <span className="text-slate-600 text-xs font-bold">•</span>
                  <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">
                    {deliveryStage.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">ETA: {eta}m</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Screen Content */}
      <div className="flex-1 overflow-hidden">
        {activeScreen === 'browse' && (
          <>
            {deliveryStage !== 'IDLE' && activeOrder ? (
              /* Instead of blocking navigation, show ActiveOrderScreen under the 'browse' tab */
              <ActiveOrderScreen
                stage={deliveryStage}
                stageProgress={stageProgress}
                eta={eta}
                currentSavings={currentSavings}
                restaurantName={activeOrder.restaurantName}
                cuisine={activeOrder.cuisine}
              />
            ) : !activeRestaurant ? (
              <HomeScreen onSelectRestaurant={setActiveRestaurant} />
            ) : (
              <MenuScreen
                restaurant={activeRestaurant}
                onBack={() => {
                  // Go back in history if the current history state has a restaurant
                  const currentHistoryState = window.history.state as AppHistoryState;
                  if (currentHistoryState && currentHistoryState.restaurantId) {
                    window.history.back();
                  } else {
                    setActiveRestaurant(null);
                  }
                }}
              />
            )}
          </>
        )}

        {activeScreen === 'dashboard' && <DashboardScreen />}

        {activeScreen === 'settings' && <SettingsScreen />}
      </div>

      {/* Global Cart Overlay (only visible when browsing and not in a sub-screen) */}
      {activeScreen === 'browse' && deliveryStage === 'IDLE' && (
        <CartOverlay 
          onCheckout={handleCheckout} 
          isExpanded={isCartExpanded}
          setIsExpanded={setIsCartExpanded}
        />
      )}

      {/* Persistent Bottom Tab Bar */}
      <BottomNavigation
        activeScreen={activeScreen}
        setActiveScreen={(screen) => {
          // If we navigate away from browse, clear active restaurant so next time they open browse they see the home list
          if (screen !== 'browse') {
            setActiveRestaurant(null);
          }
          setActiveScreen(screen);
        }}
        isSimulating={deliveryStage !== 'IDLE'}
      />

      {/* Post-Delivery Behavioral Logging Modal */}
      {lastOrderDetails && (
        <CravingsLogModal
          isOpen={isLogModalOpen}
          amountSaved={lastOrderDetails.amountSaved}
          restaurantName={lastOrderDetails.restaurantName}
          initialTrigger={lastOrderDetails.trigger || null}
          onSave={handleLogSave}
        />
      )}
    </div>
  );
};
export default App;

import { useAppStore } from '../store/useAppStore';

const triggerVibrate = (pattern: number | number[]) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    const { settings } = useAppStore.getState();
    if (settings.hapticsEnabled) {
      navigator.vibrate(pattern);
    }
  }
};

export const haptics = {
  /**
   * Micro-interaction: Extremely light tap for minor UI actions
   * e.g., tapping a category, opening a modal.
   */
  lightTap: () => {
    triggerVibrate(12);
  },

  /**
   * Micro-interaction: Medium tap for a satisfying action
   * e.g., successfully adding an item to the cart.
   */
  mediumTap: () => {
    triggerVibrate(22);
  },

  /**
   * Milestone: Celebratory haptic pattern
   * e.g., rider arriving, order completed, adding to savings.
   */
  successNotification: () => {
    triggerVibrate([40, 80, 40, 80, 60]);
  },

  /**
   * Warning: Warning haptic pattern
   * e.g., clearing cart, deleting savings history.
   */
  warningNotification: () => {
    triggerVibrate([60, 100, 60]);
  }
};

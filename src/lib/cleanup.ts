// src/lib/cleanup.ts
// Utilities for cleaning up listeners and subscriptions

export interface Subscription {
  unsubscribe?: () => void;
  remove?: () => void;
}

export const createCleanupManager = () => {
  const subscriptions: Subscription[] = [];
  const listeners: Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
  }> = [];

  const addSubscription = (subscription: Subscription | null | undefined) => {
    if (subscription) {
      subscriptions.push(subscription);
    }
    return subscription;
  };

  const addListener = (
    element: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    element.addEventListener(event, handler);
    listeners.push({ element, event, handler });
  };

  const cleanupAll = () => {
    // Unsubscribe from all subscriptions
    subscriptions.forEach((sub) => {
      try {
        if (sub.unsubscribe) sub.unsubscribe();
        if (sub.remove) sub.remove();
      } catch (e) {
        console.warn("Error unsubscribing:", e);
      }
    });
    subscriptions.length = 0;

    // Remove all event listeners
    listeners.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (e) {
        console.warn("Error removing listener:", e);
      }
    });
    listeners.length = 0;
  };

  return { addSubscription, addListener, cleanupAll };
};

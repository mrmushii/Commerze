// lib/cartEvents.ts
// This utility dispatches a custom event to notify components when the cart changes.

/**
 * Dispatches a custom 'cartUpdated' event on the window object.
 * Other components can listen for this event to react to cart changes
 * that occur within the same browser tab/window.
 */
export const dispatchCartUpdateEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'));
  }
};
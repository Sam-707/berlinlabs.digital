/**
 * Order Persistence Utilities
 * Handles localStorage-based persistence of active customer orders
 * Allows customers to close and reopen the app without losing their order connection
 */

export interface ActiveOrderData {
  code: string;
  table?: string;
  timestamp: number;
}

const ACTIVE_ORDER_KEY = 'menuflows_active_order';
const ORDER_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Save active order to localStorage
 * @param orderCode - The handshake code for the order
 * @param tableNumber - Optional table number
 */
export const saveActiveOrder = (orderCode: string, tableNumber?: string): void => {
  try {
    const data: ActiveOrderData = {
      code: orderCode,
      table: tableNumber,
      timestamp: Date.now(),
    };
    localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save active order:', error);
  }
};

/**
 * Get active order from localStorage
 * @returns Active order data if exists and not expired, null otherwise
 */
export const getActiveOrder = (): ActiveOrderData | null => {
  try {
    const data = localStorage.getItem(ACTIVE_ORDER_KEY);
    if (!data) return null;

    const order: ActiveOrderData = JSON.parse(data);

    // Check if order has expired (older than 4 hours)
    if (Date.now() - order.timestamp > ORDER_EXPIRY_MS) {
      clearActiveOrder();
      return null;
    }

    return order;
  } catch (error) {
    console.error('Failed to get active order:', error);
    return null;
  }
};

/**
 * Clear active order from localStorage
 * Called when order is served or user manually dismisses
 */
export const clearActiveOrder = (): void => {
  try {
    localStorage.removeItem(ACTIVE_ORDER_KEY);
  } catch (error) {
    console.error('Failed to clear active order:', error);
  }
};

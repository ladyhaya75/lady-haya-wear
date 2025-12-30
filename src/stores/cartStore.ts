import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-toastify';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  imageAlt?: string;
  color: string;
  colorHex: string;
  size: string;
  quantity: number;
  maxQuantity: number;
  slug: string;
}

interface CartState {
  cartItems: CartItem[];
  isLoading: boolean;
  syncTimeout: NodeJS.Timeout | null;
  
  // Actions
  addToCart: (newItem: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  
  // Computed
  getCartTotal: () => number;
  getCartCount: () => number;
  
  // Sync
  syncWithServer: (userId: string | null) => void;
  setSyncTimeout: (timeout: NodeJS.Timeout | null) => void;
}

// Fonction de synchronisation avec debouncing
let syncTimeoutId: NodeJS.Timeout | null = null;

const debouncedSync = (items: CartItem[], userId: string | null) => {
  if (syncTimeoutId) {
    clearTimeout(syncTimeoutId);
  }

  syncTimeoutId = setTimeout(() => {
    if (userId && items.length > 0) {
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ localCartItems: items }),
      }).catch((error) => {
        console.error('Erreur lors de la synchronisation:', error);
      });
    }
  }, 1000);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isLoading: false,
      syncTimeout: null,

      addToCart: (newItem) => {
        set((state) => {
          const existingItemIndex = state.cartItems.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.color === newItem.color &&
              item.size === newItem.size
          );

          let updatedItems: CartItem[];
          if (existingItemIndex !== -1) {
            updatedItems = [...state.cartItems];
            const currentQuantity = updatedItems[existingItemIndex].quantity;
            const newTotalQuantity = currentQuantity + newItem.quantity;
            const maxAllowed = Math.min(newTotalQuantity, newItem.maxQuantity);
            updatedItems[existingItemIndex].quantity = maxAllowed;
          } else {
            const id = `${newItem.productId}-${newItem.color}-${newItem.size}`;
            updatedItems = [...state.cartItems, { ...newItem, id }];
          }

          return { cartItems: updatedItems };
        });
      },

      removeFromCart: (id) => {
        const itemToRemove = get().cartItems.find((item) => item.id === id);
        
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        }));

        if (itemToRemove) {
          setTimeout(() => {
            toast.info(
              <div>
                <div className="font-semibold">Produit supprimé du panier</div>
                <div className="text-sm opacity-90">
                  {itemToRemove.name} - {itemToRemove.color} - Taille {itemToRemove.size}
                </div>
              </div>,
              {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }, 0);
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        set((state) => ({
          cartItems: state.cartItems.map((item) => {
            if (item.id === id) {
              const maxAllowed = Math.min(quantity, item.maxQuantity);
              return { ...item, quantity: maxAllowed };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ cartItems: [] });
      },

      setCartItems: (items) => {
        set({ cartItems: items });
      },

      getCartTotal: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getCartCount: () => {
        return get().cartItems.reduce((count, item) => count + item.quantity, 0);
      },

      syncWithServer: (userId) => {
        const items = get().cartItems;
        debouncedSync(items, userId);
      },

      setSyncTimeout: (timeout) => {
        set({ syncTimeout: timeout });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Écouter les événements de synchronisation globaux
if (typeof window !== 'undefined') {
  window.addEventListener('cartSynced', ((event: CustomEvent) => {
    const { cartItems: syncedItems } = event.detail;
    if (
      localStorage.getItem('migrationDone') === 'true' ||
      syncedItems.length > 0
    ) {
      useCartStore.getState().setCartItems(syncedItems);
      if (localStorage.getItem('migrationDone') === 'true') {
        localStorage.removeItem('cart');
        localStorage.removeItem('migrationDone');
      }
    }
  }) as EventListener);

  window.addEventListener('cartCleared', () => {
    useCartStore.getState().clearCart();
  });
}


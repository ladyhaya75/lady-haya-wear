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
  optimisticUpdates: string[]; // Array instead of Set for persistence
  
  // Actions
  addToCart: (newItem: Omit<CartItem, 'id'>, userId?: string | null) => Promise<void>;
  removeFromCart: (id: string, userId?: string | null) => Promise<void>;
  updateQuantity: (id: string, quantity: number, userId?: string | null) => Promise<void>;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  
  // Optimistic actions
  addOptimisticUpdate: (itemId: string) => void;
  removeOptimisticUpdate: (itemId: string) => void;
  isOptimistic: (itemId: string) => boolean;
  
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
      optimisticUpdates: [] as string[],

      addOptimisticUpdate: (itemId) => {
        set((state) => ({
          optimisticUpdates: [...state.optimisticUpdates, itemId]
        }));
      },

      removeOptimisticUpdate: (itemId) => {
        set((state) => ({
          optimisticUpdates: state.optimisticUpdates.filter(id => id !== itemId)
        }));
      },

      isOptimistic: (itemId) => {
        return get().optimisticUpdates.includes(itemId);
      },

      addToCart: async (newItem, userId = null) => {
        // 1. OPTIMISTIC UPDATE - Mise à jour immédiate de l'UI
        const previousCartItems = get().cartItems;
        const itemId = `${newItem.productId}-${newItem.color}-${newItem.size}`;
        
        get().addOptimisticUpdate(itemId);

        let updatedItems: CartItem[];
        const existingItemIndex = previousCartItems.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.color === newItem.color &&
            item.size === newItem.size
        );

        if (existingItemIndex !== -1) {
          updatedItems = [...previousCartItems];
          const currentQuantity = updatedItems[existingItemIndex].quantity;
          const newTotalQuantity = currentQuantity + newItem.quantity;
          const maxAllowed = Math.min(newTotalQuantity, newItem.maxQuantity);
          updatedItems[existingItemIndex].quantity = maxAllowed;
        } else {
          updatedItems = [...previousCartItems, { ...newItem, id: itemId }];
        }

        set({ cartItems: updatedItems });

        // 2. SYNC AVEC LE SERVEUR - En arrière-plan
        if (userId) {
          try {
            const response = await fetch('/api/cart/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ localCartItems: updatedItems }),
            });

            if (!response.ok) {
              throw new Error('Échec de la synchronisation');
            }

            // Sync réussi, on retire l'état optimiste
            get().removeOptimisticUpdate(itemId);
          } catch (error) {
            // 3. ROLLBACK - En cas d'échec, on annule le changement
            console.error('Erreur lors de la synchronisation du panier:', error);
            
            set({ cartItems: previousCartItems });
            get().removeOptimisticUpdate(itemId);
            
            toast.error(
              <div>
                <div className="font-semibold">❌ Erreur</div>
                <div className="text-sm opacity-90">
                  Impossible d'ajouter {newItem.name} au panier. Veuillez réessayer.
                </div>
              </div>,
              {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }
        } else {
          // Pas d'utilisateur connecté, on retire juste l'état optimiste
          get().removeOptimisticUpdate(itemId);
        }
      },

      removeFromCart: async (id, userId = null) => {
        const itemToRemove = get().cartItems.find((item) => item.id === id);
        
        if (!itemToRemove) return;

        // 1. OPTIMISTIC UPDATE - Mise à jour immédiate de l'UI
        const previousCartItems = get().cartItems;
        get().addOptimisticUpdate(id);
        
        const updatedItems = previousCartItems.filter((item) => item.id !== id);
        set({ cartItems: updatedItems });

        // Toast de confirmation immédiat
        toast.info(
          <div>
            <div className="font-semibold">🗑️ Produit supprimé du panier</div>
            <div className="text-sm opacity-90">
              {itemToRemove.name} - {itemToRemove.color} - Taille {itemToRemove.size}
            </div>
          </div>,
          {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        // 2. SYNC AVEC LE SERVEUR - En arrière-plan
        if (userId) {
          try {
            const response = await fetch('/api/cart/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ localCartItems: updatedItems }),
            });

            if (!response.ok) {
              throw new Error('Échec de la synchronisation');
            }

            // Sync réussi, on retire l'état optimiste
            get().removeOptimisticUpdate(id);
          } catch (error) {
            // 3. ROLLBACK - En cas d'échec, on annule le changement
            console.error('Erreur lors de la suppression du panier:', error);
            
            set({ cartItems: previousCartItems });
            get().removeOptimisticUpdate(id);
            
            toast.error(
              <div>
                <div className="font-semibold">❌ Erreur</div>
                <div className="text-sm opacity-90">
                  Impossible de supprimer {itemToRemove.name}. Veuillez réessayer.
                </div>
              </div>,
              {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }
        } else {
          // Pas d'utilisateur connecté, on retire juste l'état optimiste
          get().removeOptimisticUpdate(id);
        }
      },

      updateQuantity: async (id, quantity, userId = null) => {
        if (quantity <= 0) {
          await get().removeFromCart(id, userId);
          return;
        }

        // 1. OPTIMISTIC UPDATE - Mise à jour immédiate de l'UI
        const previousCartItems = get().cartItems;
        get().addOptimisticUpdate(id);

        const updatedItems = previousCartItems.map((item) => {
          if (item.id === id) {
            const maxAllowed = Math.min(quantity, item.maxQuantity);
            return { ...item, quantity: maxAllowed };
          }
          return item;
        });

        set({ cartItems: updatedItems });

        // 2. SYNC AVEC LE SERVEUR - En arrière-plan
        if (userId) {
          try {
            const response = await fetch('/api/cart/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ localCartItems: updatedItems }),
            });

            if (!response.ok) {
              throw new Error('Échec de la synchronisation');
            }

            // Sync réussi, on retire l'état optimiste
            get().removeOptimisticUpdate(id);
          } catch (error) {
            // 3. ROLLBACK - En cas d'échec, on annule le changement
            console.error('Erreur lors de la mise à jour de la quantité:', error);
            
            set({ cartItems: previousCartItems });
            get().removeOptimisticUpdate(id);
            
            const item = previousCartItems.find((i) => i.id === id);
            toast.error(
              <div>
                <div className="font-semibold">❌ Erreur</div>
                <div className="text-sm opacity-90">
                  Impossible de mettre à jour la quantité{item ? ` de ${item.name}` : ''}. Veuillez réessayer.
                </div>
              </div>,
              {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }
        } else {
          // Pas d'utilisateur connecté, on retire juste l'état optimiste
          get().removeOptimisticUpdate(id);
        }
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
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Migration pour nettoyer optimisticUpdates si c'est un Set
        if (persistedState?.optimisticUpdates && !Array.isArray(persistedState.optimisticUpdates)) {
          persistedState.optimisticUpdates = [];
        }
        return persistedState;
      },
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


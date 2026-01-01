import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-toastify';

export interface Product {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  imageAlt?: string;
  slug?: string;
  category?: {
    _id: string;
    name: string;
    slug: {
      current: string;
    };
  };
}

interface FavoritesState {
  favorites: Product[];
  isLoading: boolean;
  optimisticUpdates: string[]; // Array instead of Set for persistence
  
  // Actions
  addToFavorites: (product: Product, userId: string | null) => Promise<void>;
  removeFromFavorites: (productId: string, userId: string | null) => Promise<void>;
  toggleFavorite: (product: Product, userId: string | null) => Promise<void>;
  clearAllFavorites: () => void;
  setFavorites: (favorites: Product[]) => void;
  
  // Optimistic actions
  addOptimisticUpdate: (productId: string) => void;
  removeOptimisticUpdate: (productId: string) => void;
  isOptimistic: (productId: string) => boolean;
  
  // Computed
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      optimisticUpdates: [],

      addOptimisticUpdate: (productId) => {
        set((state) => ({
          optimisticUpdates: [...state.optimisticUpdates, productId]
        }));
      },

      removeOptimisticUpdate: (productId) => {
        set((state) => ({
          optimisticUpdates: state.optimisticUpdates.filter(id => id !== productId)
        }));
      },

      isOptimistic: (productId) => {
        return get().optimisticUpdates.includes(productId);
      },

      addToFavorites: async (product, userId) => {
        const existingFavorite = get().favorites.find(
          (fav) => fav.productId === product.productId
        );

        if (existingFavorite) {
          toast.info(
            <div>
              <div className="font-semibold">Favori déjà ajouté</div>
              <div className="text-sm opacity-90">
                {product.name} est déjà dans vos favoris
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
          return;
        }

        // 1. OPTIMISTIC UPDATE - Mise à jour immédiate de l'UI
        const previousFavorites = get().favorites;
        get().addOptimisticUpdate(product.productId);
        
        set((state) => ({
          favorites: [...state.favorites, product],
        }));

        // Toast de confirmation immédiat
        toast.success(
          <div>
            <div className="font-semibold">✨ Favori ajouté</div>
            <div className="text-sm opacity-90">
              {product.name} a été ajouté à vos favoris
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
            const response = await fetch('/api/favorites/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ localFavorites: get().favorites }),
            });

            if (!response.ok) {
              throw new Error('Échec de la synchronisation');
            }

            // Sync réussi, on retire l'état optimiste
            get().removeOptimisticUpdate(product.productId);
          } catch (error) {
            // 3. ROLLBACK - En cas d'échec, on annule le changement
            console.error('Erreur lors de la synchronisation des favoris:', error);
            
            set({ favorites: previousFavorites });
            get().removeOptimisticUpdate(product.productId);
            
            toast.error(
              <div>
                <div className="font-semibold">❌ Erreur</div>
                <div className="text-sm opacity-90">
                  Impossible d'ajouter {product.name} aux favoris. Veuillez réessayer.
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
          get().removeOptimisticUpdate(product.productId);
        }
      },

      removeFromFavorites: async (productId, userId) => {
        const itemToRemove = get().favorites.find(
          (fav) => fav.productId === productId
        );

        if (!itemToRemove) return;

        // 1. OPTIMISTIC UPDATE - Mise à jour immédiate de l'UI
        const previousFavorites = get().favorites;
        get().addOptimisticUpdate(productId);
        
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.productId !== productId),
        }));

        // Toast de confirmation immédiat
        toast.info(
          <div>
            <div className="font-semibold">🗑️ Favori supprimé</div>
            <div className="text-sm opacity-90">
              {itemToRemove.name} a été retiré de vos favoris
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
            const response = await fetch('/api/favorites/remove', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ productId }),
            });

            if (!response.ok) {
              throw new Error('Échec de la suppression');
            }

            // Sync réussi, on retire l'état optimiste
            get().removeOptimisticUpdate(productId);
          } catch (error) {
            // 3. ROLLBACK - En cas d'échec, on annule le changement
            console.error('Erreur lors de la suppression des favoris:', error);
            
            set({ favorites: previousFavorites });
            get().removeOptimisticUpdate(productId);
            
            toast.error(
              <div>
                <div className="font-semibold">❌ Erreur</div>
                <div className="text-sm opacity-90">
                  Impossible de retirer {itemToRemove.name} des favoris. Veuillez réessayer.
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
          get().removeOptimisticUpdate(productId);
        }
      },

      toggleFavorite: async (product, userId) => {
        const exists = get().favorites.find(
          (fav) => fav.productId === product.productId
        );

        if (exists) {
          await get().removeFromFavorites(product.productId, userId);
        } else {
          await get().addToFavorites(product, userId);
        }
      },

      clearAllFavorites: () => {
        set({ favorites: [] });
      },

      setFavorites: (favorites) => {
        set({ favorites });
      },

      isFavorite: (productId) => {
        return get().favorites.some((fav) => fav.productId === productId);
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Écouter les événements de synchronisation globaux
if (typeof window !== 'undefined') {
  window.addEventListener('favoritesSynced', ((event: CustomEvent) => {
    const { favorites: syncedFavorites } = event.detail;
    if (
      localStorage.getItem('migrationDone') === 'true' ||
      syncedFavorites.length > 0
    ) {
      useFavoritesStore.getState().setFavorites(syncedFavorites);
      if (localStorage.getItem('migrationDone') === 'true') {
        localStorage.removeItem('favorites');
        localStorage.removeItem('migrationDone');
      }
    }
  }) as EventListener);

  window.addEventListener('favoritesCleared', () => {
    useFavoritesStore.getState().clearAllFavorites();
  });
}


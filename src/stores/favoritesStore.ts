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
  
  // Actions
  addToFavorites: (product: Product, userId: string | null) => void;
  removeFromFavorites: (productId: string, userId: string | null) => void;
  toggleFavorite: (product: Product, userId: string | null) => void;
  clearAllFavorites: () => void;
  setFavorites: (favorites: Product[]) => void;
  
  // Computed
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,

      addToFavorites: (product, userId) => {
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
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          return;
        }

        set((state) => ({
          favorites: [...state.favorites, product],
        }));

        // Synchroniser avec la base de données si l'utilisateur est connecté
        if (userId) {
          fetch('/api/favorites/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ localFavorites: [...get().favorites, product] }),
          }).catch((error) => {
            console.error('Erreur lors de la synchronisation des favoris:', error);
          });
        }

        toast.success(
          <div>
            <div className="font-semibold">Favori ajouté</div>
            <div className="text-sm opacity-90">
              {product.name} a été ajouté à vos favoris
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
      },

      removeFromFavorites: (productId, userId) => {
        const itemToRemove = get().favorites.find(
          (fav) => fav.productId === productId
        );

        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.productId !== productId),
        }));

        // Synchroniser avec la base de données si l'utilisateur est connecté
        if (userId) {
          fetch('/api/favorites/remove', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
          }).catch((error) => {
            console.error('Erreur lors de la suppression des favoris:', error);
          });
        }

        if (itemToRemove) {
          toast.info(
            <div>
              <div className="font-semibold">Favori supprimé</div>
              <div className="text-sm opacity-90">
                {itemToRemove.name} a été retiré de vos favoris
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
        }
      },

      toggleFavorite: (product, userId) => {
        const exists = get().favorites.find(
          (fav) => fav.productId === product.productId
        );

        if (exists) {
          get().removeFromFavorites(product.productId, userId);
        } else {
          get().addToFavorites(product, userId);
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


import { create } from 'zustand';
import { useCartStore } from './cartStore';
import { useFavoritesStore } from './favoritesStore';

export interface User {
  id: string;
  email: string;
  name: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  syncCartAndFavorites: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  checkAuth: async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, loading: false, isAuthenticated: true });
        
        // Synchroniser cart et favoris après authentification
        setTimeout(() => get().syncCartAndFavorites(), 200);
        setTimeout(() => hydrateContextsFromDB(), 400);
      } else {
        set({ user: null, loading: false, isAuthenticated: false });
      }
    } catch (error) {
      set({ user: null, loading: false, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        set({ user: data.user, loading: false, isAuthenticated: true });

        setTimeout(() => {
          get().syncCartAndFavorites();
        }, 200);
        setTimeout(() => hydrateContextsFromDB(), 400);

        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Silently handle logout error
    }

    document.cookie = 'auth-token=; Max-Age=0; path=/';
    set({ user: null, loading: false, isAuthenticated: false });

    // Clear cart and favorites
    useCartStore.getState().clearCart();
    useFavoritesStore.getState().clearAllFavorites();

    window.dispatchEvent(new CustomEvent('cartCleared'));
    window.dispatchEvent(new CustomEvent('favoritesCleared'));
  },

  syncCartAndFavorites: async () => {
    try {
      const { user } = get();
      if (!user) return;

      const cartState = useCartStore.getState();
      const favoritesState = useFavoritesStore.getState();

      const localCartItems = cartState.cartItems;
      const localFavoritesItems = favoritesState.favorites;

      // Sync cart
      try {
        const cartResponse = await fetch('/api/cart/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ localCartItems }),
        });

        if (cartResponse.ok) {
          const { cartItems } = await cartResponse.json();
          useCartStore.getState().setCartItems(cartItems);
          window.dispatchEvent(
            new CustomEvent('cartSynced', { detail: { cartItems } })
          );
        }
      } catch (error) {
        // Silently handle cart sync error
      }

      // Sync favorites
      try {
        const favoritesResponse = await fetch('/api/favorites/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ localFavorites: localFavoritesItems }),
        });

        if (favoritesResponse.ok) {
          const { favorites } = await favoritesResponse.json();
          useFavoritesStore.getState().setFavorites(favorites);
          window.dispatchEvent(
            new CustomEvent('favoritesSynced', { detail: { favorites } })
          );
        }
      } catch (error) {
        // Silently handle favorites sync error
      }
    } catch (error) {
      // Silently handle general sync error
    }
  },
}));

// Helper function to hydrate contexts from DB
const hydrateContextsFromDB = async () => {
  try {
    const favRes = await fetch('/api/favorites/sync', {
      credentials: 'include',
    });
    if (favRes.ok) {
      const { favorites } = await favRes.json();
      useFavoritesStore.getState().setFavorites(favorites);
      window.dispatchEvent(
        new CustomEvent('favoritesSynced', { detail: { favorites } })
      );
    }
  } catch (e) {
    // Silently handle favorites sync error
  }

  try {
    const cartRes = await fetch('/api/cart/sync', { credentials: 'include' });
    if (cartRes.ok) {
      const { cartItems } = await cartRes.json();
      useCartStore.getState().setCartItems(cartItems);
      window.dispatchEvent(
        new CustomEvent('cartSynced', { detail: { cartItems } })
      );
    }
  } catch (e) {
    // Silently handle cart sync error
  }
};

// Initialize auth check on store creation
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}


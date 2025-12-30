import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, queryOptions } from '@/lib/react-query';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';

export interface User {
  id: string;
  email: string;
  name: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Hook pour gérer l'authentification avec cache automatique
 * Remplace progressivement AuthStore
 */
export function useAuthQuery() {
  const queryClient = useQueryClient();
  
  // Query pour récupérer l'utilisateur
  const userQuery = useQuery({
    queryKey: queryKeys.user,
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          return null;
        }
        
        const data = await response.json();
        return data.user;
      } catch {
        return null;
      }
    },
    ...queryOptions.user,
    // Ne pas afficher d'erreur si non connecté
    retry: false,
  });
  
  // Mutation pour la connexion
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Mettre à jour le cache utilisateur
      queryClient.setQueryData(queryKeys.user, data.user);
      
      // Synchroniser panier et favoris
      setTimeout(() => {
        syncCartAndFavorites();
      }, 200);
    },
  });
  
  // Mutation pour la déconnexion
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    },
    onSuccess: () => {
      // Invalider le cache utilisateur
      queryClient.setQueryData(queryKeys.user, null);
      
      // Vider panier et favoris
      useCartStore.getState().clearCart();
      useFavoritesStore.getState().clearAllFavorites();
      
      // Invalider toutes les queries qui dépendent de l'auth
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
  
  return {
    user: userQuery.data ?? null,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

// Helper pour synchroniser panier et favoris
async function syncCartAndFavorites() {
  const cartState = useCartStore.getState();
  const favoritesState = useFavoritesStore.getState();

  try {
    // Sync cart
    const cartResponse = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ localCartItems: cartState.cartItems }),
      credentials: 'include',
    });

    if (cartResponse.ok) {
      const { cartItems } = await cartResponse.json();
      useCartStore.getState().setCartItems(cartItems);
    }
  } catch (error) {
    console.error('Erreur sync cart:', error);
  }

  try {
    // Sync favorites
    const favoritesResponse = await fetch('/api/favorites/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ localFavorites: favoritesState.favorites }),
      credentials: 'include',
    });

    if (favoritesResponse.ok) {
      const { favorites } = await favoritesResponse.json();
      useFavoritesStore.getState().setFavorites(favorites);
    }
  } catch (error) {
    console.error('Erreur sync favorites:', error);
  }
}


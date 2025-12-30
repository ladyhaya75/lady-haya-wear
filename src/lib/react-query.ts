import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration du QueryClient pour TanStack Query
 * 
 * Options optimisées pour l'e-commerce :
 * - Cache long pour les données produits (5 min)
 * - Refetch en arrière-plan
 * - Retry automatique en cas d'erreur réseau
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Temps avant que les données soient considérées comme "stale" (périmées)
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Temps que les données restent en cache
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      
      // Refetch automatique quand la fenêtre reprend le focus
      refetchOnWindowFocus: true,
      
      // Refetch automatique à la reconnexion
      refetchOnReconnect: true,
      
      // Retry en cas d'erreur (3 fois avec backoff exponentiel)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry pour les mutations (plus conservateur)
      retry: 1,
    },
  },
});

/**
 * Configuration spécifique pour différents types de données
 */
export const queryOptions = {
  // Données utilisateur (profile, auth)
  user: {
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 15 * 60 * 1000, // 15 min
  },
  
  // Données produits
  products: {
    staleTime: 10 * 60 * 1000, // 10 min (changent peu)
    gcTime: 30 * 60 * 1000, // 30 min
  },
  
  // Commandes
  orders: {
    staleTime: 2 * 60 * 1000, // 2 min (peuvent changer rapidement)
    gcTime: 10 * 60 * 1000, // 10 min
  },
  
  // Stats dashboard (admin)
  stats: {
    staleTime: 1 * 60 * 1000, // 1 min
    gcTime: 5 * 60 * 1000, // 5 min
  },
};

/**
 * Query keys pour éviter les duplications
 */
export const queryKeys = {
  // Auth
  user: ['user'] as const,
  
  // Orders
  orders: ['orders'] as const,
  orderById: (id: string) => ['orders', id] as const,
  
  // Products
  products: ['products'] as const,
  productById: (id: string) => ['products', id] as const,
  productsByCategory: (slug: string) => ['products', 'category', slug] as const,
  
  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  dashboardOrders: ['dashboard', 'orders'] as const,
  dashboardProducts: ['dashboard', 'products'] as const,
  
  // Favorites
  favorites: ['favorites'] as const,
} as const;


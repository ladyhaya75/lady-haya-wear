import { useQuery } from '@tanstack/react-query';
import { queryKeys, queryOptions } from '@/lib/react-query';

// Types pour le dashboard
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  totalUsers: number;
  todayRevenue: number;
  todayOrders: number;
  conversionRate: number;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  colors: Array<{
    name: string;
    sizes: Array<{
      size: string;
      quantity: number;
    }>;
  }>;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

/**
 * Hook pour récupérer les statistiques du dashboard
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async (): Promise<DashboardStats> => {
      // Simuler les stats (à remplacer par l'API réelle)
      return {
        totalRevenue: 0,
        totalOrders: 0,
        activeProducts: 0,
        totalUsers: 0,
        todayRevenue: 0,
        todayOrders: 0,
        conversionRate: 0,
      };
    },
    ...queryOptions.stats,
  });
}

/**
 * Hook pour récupérer les produits en rupture de stock
 */
export function useLowStockProducts() {
  return useQuery({
    queryKey: [...queryKeys.dashboardProducts, 'low-stock'],
    queryFn: async (): Promise<LowStockProduct[]> => {
      const response = await fetch('/api/admin/products/low-stock', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      
      const data = await response.json();
      return data.products || [];
    },
    ...queryOptions.stats,
  });
}

/**
 * Hook pour récupérer les commandes récentes
 */
export function useRecentOrders(limit: number = 5) {
  return useQuery({
    queryKey: [...queryKeys.dashboardOrders, 'recent', limit],
    queryFn: async (): Promise<RecentOrder[]> => {
      const response = await fetch(`/api/admin/orders?limit=${limit}&sort=recent`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes');
      }
      
      const data = await response.json();
      return data.orders || [];
    },
    ...queryOptions.stats,
  });
}


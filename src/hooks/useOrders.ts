import { useQuery } from '@tanstack/react-query';
import { queryKeys, queryOptions } from '@/lib/react-query';

// Types pour les commandes
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  colorName?: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  id: string;
  civility?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  promoDiscount: number;
  paymentMethod?: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  carrier?: string;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  promoCode?: {
    id: string;
    code: string;
    type: string;
    value: number;
  };
}

/**
 * Hook pour récupérer toutes les commandes de l'utilisateur
 * Avec cache automatique et refetch en arrière-plan
 */
export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: async (): Promise<Order[]> => {
      const response = await fetch('/api/user/orders', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes');
      }
      
      const data = await response.json();
      return data.orders || [];
    },
    // Options spécifiques aux commandes
    ...queryOptions.orders,
    // Désactiver si l'utilisateur n'est pas connecté
    enabled: true, // On laisse le composant gérer ça
  });
}

/**
 * Hook pour récupérer une commande spécifique par son ID
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: orderId ? queryKeys.orderById(orderId) : ['orders', 'null'],
    queryFn: async (): Promise<Order> => {
      if (!orderId) throw new Error('Order ID is required');
      
      const response = await fetch(`/api/user/orders?id=${orderId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Commande introuvable');
      }
      
      const data = await response.json();
      return data.order;
    },
    enabled: !!orderId,
    ...queryOptions.orders,
  });
}


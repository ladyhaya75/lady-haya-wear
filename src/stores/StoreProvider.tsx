"use client";

import { useEffect } from 'react';
import { useAuthStore } from './authStore';
import { useCartStore } from './cartStore';

/**
 * Provider client pour initialiser les stores Zustand
 * Il s'assure que l'authentification est vérifiée au démarrage
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Vérifier l'authentification au démarrage de l'app
    useAuthStore.getState().checkAuth();
  }, []);

  useEffect(() => {
    // Écouter les changements d'auth pour synchroniser avec le serveur
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.user) {
        // L'utilisateur est connecté, on peut synchroniser le panier avec le serveur
        useCartStore.getState().syncWithServer(state.user.id);
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}


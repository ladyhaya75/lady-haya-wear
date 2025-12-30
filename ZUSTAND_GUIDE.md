# 🚀 Guide Rapide Zustand

## 📦 Stores Disponibles

### 1. **CartStore** - Gestion du Panier

```tsx
import { useCartStore } from '@/stores/cartStore';

// Dans un composant
function MyComponent() {
  // ✅ Sélectionner uniquement ce dont vous avez besoin
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  const getCartCount = useCartStore((state) => state.getCartCount);
  
  // Ou tout le store (⚠️ cause plus de re-renders)
  const cart = useCartStore();
}
```

**Actions disponibles:**
- `addToCart(item)` - Ajouter un produit
- `removeFromCart(id)` - Supprimer un produit
- `updateQuantity(id, quantity)` - Modifier la quantité
- `clearCart()` - Vider le panier
- `getCartTotal()` - Calculer le total
- `getCartCount()` - Nombre d'articles

---

### 2. **FavoritesStore** - Gestion des Favoris

```tsx
import { useFavoritesStore } from '@/stores/favoritesStore';

function MyComponent() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const addToFavorites = useFavoritesStore((state) => state.addToFavorites);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  
  const user = useAuthStore((state) => state.user);
  
  const handleAddFavorite = (product) => {
    addToFavorites(product, user?.id || null);
  };
}
```

**Actions disponibles:**
- `addToFavorites(product, userId)` - Ajouter aux favoris
- `removeFromFavorites(productId, userId)` - Retirer des favoris
- `toggleFavorite(product, userId)` - Toggle favori
- `clearAllFavorites()` - Vider tous les favoris
- `isFavorite(productId)` - Vérifier si favori

---

### 3. **AuthStore** - Authentification

```tsx
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Connexion réussie
    }
  };
}
```

**Actions disponibles:**
- `login(email, password)` - Se connecter
- `logout()` - Se déconnecter
- `checkAuth()` - Vérifier l'authentification
- `syncCartAndFavorites()` - Synchroniser avec le serveur

---

## 💡 Bonnes Pratiques

### ✅ À FAIRE

```tsx
// 1. Sélectionner uniquement ce dont vous avez besoin
const cartCount = useCartStore((state) => state.getCartCount);

// 2. Utiliser plusieurs sélecteurs si nécessaire
const cartItems = useCartStore((state) => state.cartItems);
const addToCart = useCartStore((state) => state.addToCart);

// 3. Accéder au store en dehors d'un composant
import { useCartStore } from '@/stores/cartStore';
function myUtilityFunction() {
  const cart = useCartStore.getState();
  cart.clearCart();
}
```

### ❌ À ÉVITER

```tsx
// ❌ Prendre tout le store (cause trop de re-renders)
const cart = useCartStore();

// ❌ Destructurer (perd l'optimisation)
const { cartItems, addToCart } = useCartStore();

// ✅ Préférer ceci
const cartItems = useCartStore((state) => state.cartItems);
const addToCart = useCartStore((state) => state.addToCart);
```

---

## 🔄 Synchronisation Automatique

Les stores se synchronisent automatiquement :

1. **localStorage** : Sauvegarde automatique via le middleware `persist`
2. **Serveur** : Synchronisation automatique quand l'utilisateur est connecté
3. **Événements globaux** : Les stores écoutent les événements `cartSynced`, `favoritesSynced`, etc.

---

## 🐛 Debugging

### Avec Redux DevTools

```tsx
import { devtools } from 'zustand/middleware';

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... votre store
      }),
      { name: 'cart-storage' }
    ),
    { name: 'CartStore' } // Nom dans DevTools
  )
);
```

### Console Logging

```tsx
// Voir l'état actuel
console.log(useCartStore.getState());

// S'abonner aux changements
useCartStore.subscribe((state) => {
  console.log('Cart changed:', state.cartItems);
});
```

---

## 🎯 Exemples Complets

### Exemple 1 : Ajouter au panier avec vérification de stock

```tsx
"use client";
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';

export default function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const user = useAuthStore((state) => state.user);
  
  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor,
      colorHex: selectedColorHex,
      size: selectedSize,
      quantity: 1,
      maxQuantity: product.stock,
      slug: product.slug,
    });
    
    toast.success('Produit ajouté au panier !');
  };
  
  return (
    <button onClick={handleAddToCart}>
      Ajouter au panier
    </button>
  );
}
```

### Exemple 2 : Badge de panier avec compteur

```tsx
"use client";
import { useCartStore } from '@/stores/cartStore';

export default function CartBadge() {
  // Ce composant ne re-render que si le nombre d'articles change
  const getCartCount = useCartStore((state) => state.getCartCount);
  const count = getCartCount();
  
  if (count === 0) return null;
  
  return (
    <div className="badge">
      {count}
    </div>
  );
}
```

### Exemple 3 : Bouton favori avec toggle

```tsx
"use client";
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuthStore } from '@/stores/authStore';
import { FaHeart } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';

export default function FavoriteButton({ product }) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const user = useAuthStore((state) => state.user);
  
  const isFavorite = favorites.some(
    (fav) => fav.productId === product.id
  );
  
  const handleToggle = () => {
    toggleFavorite({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
    }, user?.id || null);
  };
  
  return (
    <button onClick={handleToggle}>
      {isFavorite ? <FaHeart /> : <FiHeart />}
    </button>
  );
}
```

---

## 📚 Ressources

- [Documentation Zustand](https://docs.pmnd.rs/zustand)
- [Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
- [Performance Tips](https://docs.pmnd.rs/zustand/guides/performance)

---

**Besoin d'aide ?** Consultez `ZUSTAND_MIGRATION.md` pour plus de détails sur la migration.


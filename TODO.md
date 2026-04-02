# TODO — Lady Haya Wear

---

## SEO — À faire après le lancement (quand les vraies collections sont créées)

### 1. Pages produits & collections dynamiques

**`src/app/products/[slug]/page.tsx`** — ajouter `generateMetadata` :
```ts
export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: [urlFor(product.mainImage)?.url()] }
  };
}
```

**`src/app/collections/[slug]/page.tsx`** — même chose avec les données de collection.

### 2. Sitemap dynamique — brancher Sanity

Dans `src/app/sitemap.ts`, ajouter les pages produits et collections dynamiques :
```ts
// Ajouter après les staticPages :
const products = await getAllUnifiedProducts(); // depuis sanity-queries
const collections = await getAllCategories();
// Puis mapper vers les URLs /products/[slug] et /collections/[slug]
```

### 3. JSON-LD Schema.org Product

Sur `products/[slug]/page.tsx`, ajouter dans le `<head>` :
```tsx
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "offers": { "@type": "Offer", "price": product.price, "priceCurrency": "EUR" }
})}</script>
```

### 4. Pages privées — robots noindex via layout

Les pages suivantes sont déjà bloquées dans `robots.ts` mais n'ont pas de balise `<meta robots>` car elles sont des Client Components. Créer un `layout.tsx` dans chaque dossier pour les couvrir :
- `src/app/cart/layout.tsx`
- `src/app/checkout/layout.tsx`
- `src/app/account/layout.tsx`
- `src/app/orders/layout.tsx`
- `src/app/reset-password/layout.tsx`
- `src/app/complete-profile/layout.tsx`
- `src/app/admin-login/layout.tsx`

Chaque layout : `export const metadata = { robots: { index: false } }`

### 5. Fonts — migrer vers next/font

Dans `src/app/globals.css` les polices sont chargées via `@import url(fonts.googleapis.com)`.
Migrer vers `next/font/google` dans `layout.tsx` pour éliminer le FOUT et les requêtes bloquantes.

---

## Google Search Console — À faire après déploiement en prod

**Étapes pour inscrire le site :**

1. Aller sur [search.google.com/search-console](https://search.google.com/search-console)
2. Cliquer **Ajouter une propriété** → choisir **Domaine** → entrer `ladyhaya-wear.fr`
3. **Vérifier la propriété** — méthode recommandée : ajouter un enregistrement TXT chez ton registrar DNS (OVH, Gandi, etc.)
   - Google fournit un code du type : `google-site-verification=xxxxx`
   - L'ajouter comme enregistrement TXT sur `ladyhaya-wear.fr`
4. Une fois vérifié, aller dans **Sitemaps** → entrer `sitemap.xml` → Envoyer
5. Attendre l'indexation (quelques jours à quelques semaines)

**Bonus :** Lier Google Search Console à Google Analytics si GA4 est configuré → données encore plus riches.

---

## Authentification sociale — Instagram & Facebook

**Statut :** Désactivé (boutons commentés dans `LoginClient.tsx`)

**Pourquoi :** Configurés en mode test uniquement. Les apps doivent passer en mode **Live** avant le lancement.

### Facebook Login
1. [developers.facebook.com](https://developers.facebook.com) → ton app → passer en mode **Live**
2. **Paramètres → Basique** → ajouter `ladyhaya-wear.fr` dans les domaines
3. **Facebook Login → Paramètres** → URI de redirection : `https://ladyhaya-wear.fr/api/auth/facebook/callback`
4. Soumettre à la vérification Meta si nécessaire

### Instagram Login
1. Même process → URI : `https://ladyhaya-wear.fr/api/auth/instagram/callback`

### Fichiers à réactiver
- `src/components/LoginClient/LoginClient.tsx` — décommenter les boutons + les `handleSocialLogin`
- Vérifier les variables sur Vercel : `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`

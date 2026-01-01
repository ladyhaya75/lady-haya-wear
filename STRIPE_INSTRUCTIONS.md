# 🚀 Instructions pour configurer Stripe

## ⚠️ IMPORTANT : Variables d'environnement requises

Vous devez créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# STRIPE (Mode Test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET
```

## 📝 Étapes pour obtenir les clés

1. **Créer un compte Stripe** : https://dashboard.stripe.com/register
2. **Activer le mode test** (toggle en haut à droite)
3. **Récupérer les clés** : https://dashboard.stripe.com/test/apikeys
   - Clé publique : `pk_test_...`
   - Clé secrète : `sk_test_...`

## 🔔 Configuration du Webhook (obligatoire)

### En local :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS

# Se connecter
stripe login

# Lancer le webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copier le webhook secret (whsec_...) dans .env.local
```

## ✅ Voir STRIPE_SETUP.md pour la documentation complète


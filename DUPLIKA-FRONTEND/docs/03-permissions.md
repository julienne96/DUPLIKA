# DUPLIKA — Matrice de permissions

Rôles : **Visiteur** (non authentifié), **Client**, **Gestionnaire**, **Admin**.
Les rôles sont stockés dans une table dédiée (`roles` / `role_user`), jamais sur `users`.

| Ressource / action | Visiteur | Client | Gestionnaire | Admin |
|---|:--:|:--:|:--:|:--:|
| Consulter le catalogue publié | ✅ | ✅ | ✅ | ✅ |
| Devis panier | ✅ | ✅ | ✅ | ✅ |
| Passer commande (invité) | ✅ | ✅ | ✅ | ✅ |
| Suivi par référence + email | ✅ | ✅ | ✅ | ✅ |
| Historique de commandes | ❌ | ✅ (les siennes) | ✅ | ✅ |
| Profil / adresses | ❌ | ✅ (les siennes) | ✅ | ✅ |
| Créer / éditer produits, variantes, médias | ❌ | ❌ | ✅ | ✅ |
| Publier / dépublier un produit | ❌ | ❌ | ✅ | ✅ |
| Catégories, collections, pages CMS | ❌ | ❌ | ✅ | ✅ |
| Mouvements de stock | ❌ | ❌ | ✅ | ✅ |
| Voir toutes les commandes | ❌ | ❌ | ✅ | ✅ |
| Changer le statut d'une commande | ❌ | ❌ | ✅ | ✅ |
| Rembourser une commande | ❌ | ❌ | ❌ | ✅ |
| Coupons et frais de livraison | ❌ | ❌ | ❌ | ✅ |
| Gérer les utilisateurs et les rôles | ❌ | ❌ | ❌ | ✅ |
| Paramètres de la boutique, clés de paiement | ❌ | ❌ | ❌ | ✅ |

## Règles transverses
- Les Policies Laravel sont la source de vérité ; le frontend ne fait que masquer l'UI.
- Un client ne peut lire une commande que si `order.user_id = auth()->id()` ou via référence + email correspondant.
- Toute action d'administration écrit une entrée d'audit (`order_events` ou journal admin).
- Rate limiting : 5 tentatives/min sur `/auth/*`, 30 req/min sur `/cart/quote` et `/checkout`.

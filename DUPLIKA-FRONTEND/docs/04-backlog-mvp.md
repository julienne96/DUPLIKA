# DUPLIKA — Backlog MVP

Priorités : **P0** indispensable au lancement · **P1** juste après · **P2** confort.

## Lot A — Socle backend (P0)
- A1 Init Laravel 11, PostgreSQL, déploiement Render, CI.
- A2 Migrations du modèle de données (docs/01) + seeders catalogue.
- A3 API Resources camelCase + endpoints catalogue publics.
- A4 `POST /cart/quote` : recalcul autoritaire prix/stock/frais/remise.
- A5 `POST /checkout` transactionnel + génération de référence.
- A6 Webhook de paiement idempotent + machine à états des commandes.
- A7 `GET /orders/{reference}` (invité : référence + email).

## Lot B — Comptes (P0/P1)
- B1 Sanctum : inscription, connexion, déconnexion (P0).
- B2 Mot de passe oublié / réinitialisation (P1).
- B3 Écrans frontend `/compte` : profil, adresses, commandes (P1).
- B4 Conversion d'une commande invité en compte à la validation (P1).

## Lot C — Paiement & logistique (P0)
- C1 Intégration du prestataire (mobile money + carte) et redirection.
- C2 E-mails transactionnels : confirmation, paiement, expédition.
- C3 Zones et méthodes de livraison administrables, franchise de port.
- C4 Numéro de suivi et statut « expédiée » depuis l'admin.

## Lot D — Administration (P0/P1)
- D1 CRUD produits/variantes/médias avec upload (P0).
- D2 Gestion des commandes et des statuts (P0).
- D3 Stock et mouvements d'inventaire (P0).
- D4 Coupons (P1) · D5 Pages CMS (P1) · D6 Tableau de bord ventes (P2).

## Lot E — Frontend restant (P1)
- E1 Brancher le client API réel (retirer le mode démo dès `VITE_API_BASE_URL` défini). *(déjà prévu dans `src/lib/api.ts`)*
- E2 Écrans compte et authentification.
- E3 JSON-LD Product / BreadcrumbList / Organization, sitemap, canoniques.
- E4 Recherche serveur paginée + filtres à facettes.
- E5 Avis clients (P2), wishlist (P2).

## Lot F — Qualité (P0/P1)
- F1 Tests Pest sur devis, checkout, stock, permissions (P0).
- F2 Tests e2e parcours d'achat (P1).
- F3 Accessibilité AA, performances Lighthouse ≥ 90 (P1).
- F4 Sauvegardes DB et monitoring des erreurs (P0).

## Définition de « terminé »
Fonctionnalité testée, permissions vérifiées, montants recalculés côté serveur, textes en français, responsive et accessible, documentée dans `docs/`.

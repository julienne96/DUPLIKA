# DUPLIKA — Contrat d'API `/api/v1`

Base : `VITE_API_BASE_URL` (ex. `https://api.duplika.com/api/v1`).
Format : JSON, enveloppe `{ "data": ..., "meta": ... }`. Erreurs : `{ "message": string, "errors": { champ: string[] } }`.
Auth : Sanctum (cookie SPA), `credentials: include`. Les endpoints catalogue sont publics.

Les noms de champs sont en **camelCase** dans les API Resources, pour correspondre 1:1 aux types de `src/lib/types.ts`.

## Catalogue (public)

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/categories` | `Category[]` |
| GET | `/collections` | `Collection[]` |
| GET | `/products` | `Product[]` (filtres : `category`, `collection`, `q`, `sort`, `page`) |
| GET | `/products/{slug}` | `Product` — 404 si non publié |
| GET | `/shipping/zones` | `ShippingZone[]` |
| GET | `/pages/{slug}` | `CmsPage` |

## Panier

**POST `/cart/quote`**
```json
{ "lines": [{ "productSlug": "...", "variantId": "...", "quantity": 2 }],
  "shipping_method_id": "...", "coupon_code": null }
```
→ `CartQuote` : `lines[]`, `subtotal`, `discount`, `shipping` (null si méthode non choisie), `total`, `currency`, `warnings[]`.
Le serveur **corrige** les quantités indisponibles et le signale dans `warnings`. Le client n'envoie jamais de prix.

## Commande

**POST `/checkout`** → `{ reference, status, paymentRedirectUrl }`
Corps : `customer{firstName,lastName,email,phone}`, `address{line1,line2?,city,zoneId,notes?}`, `shippingMethodId`, `lines[]`, `createAccount`.
Le serveur recalcule le devis ; il rejette (422) si le panier est vide ou une variante indisponible.

**GET `/orders/{reference}?email=`** → `OrderTracking` (référence + email pour les invités).

**POST `/webhooks/payment`** (public, signé) → met à jour le statut, décrémente le stock, idempotent.

## Compte (auth requise)

| Méthode | Route |
|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` |
| GET | `/me` |
| GET/PUT | `/me/profile` |
| GET/POST/PUT/DELETE | `/me/addresses` |
| GET | `/me/orders`, `/me/orders/{reference}` |

## Administration (`/admin`, rôle `admin`/`gestionnaire`)
CRUD `products`, `variants`, `media`, `categories`, `collections`, `coupons`, `shipping`, `pages` ;
`GET /admin/orders`, `PATCH /admin/orders/{id}/status`, `POST /admin/inventory/movements`, `GET /admin/stats`.

## Codes d'erreur
`401` non authentifié · `403` rôle insuffisant · `404` ressource absente/non publiée · `409` conflit de stock · `422` validation · `429` rate limit.

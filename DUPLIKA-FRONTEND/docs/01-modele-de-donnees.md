# DUPLIKA — Phase 2 : modèle de données (Laravel / PostgreSQL)

Devise unique : **XOF**. Tous les montants sont stockés en **entiers (plus petite unité)**.
Toute règle commerciale (prix, remise, frais, stock, totaux) est calculée **côté serveur**.

## 1. Vue d'ensemble

```text
users ──< addresses
users ──< orders ──< order_items
              │
              └──< order_events
categories ──< products ──< product_variants ──< inventory_movements
collections >──< products            (collection_product)
products ──< product_media
products ──< product_options ──< product_option_values
product_variants >──< product_option_values (variant_option_value)
shipping_zones ──< shipping_methods ──< orders
coupons ──< coupon_redemptions >── orders
cms_pages (indépendant)
```

## 2. Tables

### users
| colonne | type | notes |
|---|---|---|
| id | uuid pk | |
| first_name / last_name | varchar(80) | |
| email | citext unique | |
| phone | varchar(32) | format E.164 |
| password | varchar | nullable (commande invité convertie) |
| email_verified_at | timestamptz | |
| timestamps, soft deletes | | |

### roles / role_user
Rôles séparés de `users` (jamais de colonne `role` sur users) : `admin`, `gestionnaire`, `client`.

### addresses
`id, user_id fk null, line1, line2 null, city, shipping_zone_id fk, notes null, is_default bool`.

### categories
`id, slug unique, name, description, position, parent_id null`.

### collections
`id, slug unique, name, tagline, image_url, position, is_active`.
Pivot `collection_product (collection_id, product_id, position)`.

### products
| colonne | type | notes |
|---|---|---|
| id | uuid pk | |
| slug | varchar unique | |
| name, sku | varchar | sku unique |
| short_description | varchar(280) | |
| description | text | |
| category_id | fk | |
| attributes | jsonb | densité, longueur, matière… |
| sections | jsonb | blocs entretien/livraison |
| faq | jsonb | |
| rating_average / rating_count | numeric / int | dénormalisés |
| is_new | bool | |
| published_at | timestamptz null | null = brouillon |
| timestamps, soft deletes | | |

Relations d'affichage : `product_related (product_id, related_id)`, `product_add_on (product_id, add_on_id)`.

### product_media
`id, product_id, url, alt, type(image|video), position`.

### product_options / product_option_values
`product_options: id, product_id, name, position`
`product_option_values: id, product_option_id, label, swatch null, position`

### product_variants
`id, product_id, sku unique, price int, compare_at_price int null, stock int, low_stock_threshold int default 3, is_active`.
Pivot `variant_option_value (variant_id, option_value_id)` — contrainte d'unicité sur la combinaison complète.

### inventory_movements
`id, variant_id, delta int, reason(enum: reception, vente, annulation, ajustement, retour), order_id null, created_at`.
Le stock d'une variante est la somme des mouvements (colonne `stock` = cache recalculé).

### shipping_zones / shipping_methods
`shipping_zones: id, name, is_active`
`shipping_methods: id, shipping_zone_id, name, price int, delay varchar, free_above int null, is_active`

### coupons
`id, code unique, type(percent|fixed), value int, min_subtotal int null, starts_at, ends_at, max_redemptions null, per_user_limit null, is_active`.
`coupon_redemptions: id, coupon_id, order_id, user_id null, amount int`.

### orders
| colonne | notes |
|---|---|
| id, reference (unique, `DPK-XXXXXX`) | |
| user_id null, guest_email | commande invité autorisée |
| status | enum : `en_attente_paiement, payee, en_preparation, expediee, livree, annulee, remboursee` |
| customer_snapshot, address_snapshot | jsonb figés à la commande |
| shipping_method_id, shipping_label, shipping_price | figés |
| subtotal, discount, shipping, total, currency | entiers |
| coupon_id null | |
| payment_provider, payment_reference, paid_at | |
| tracking_number null, shipped_at, delivered_at | |
| timestamps | |

### order_items
`id, order_id, product_id, variant_id, name, variant_label, image_url, unit_price, compare_at_price null, quantity, line_total` — **snapshot** : jamais de jointure sur le catalogue pour réafficher une commande.

### order_events
`id, order_id, from_status, to_status, actor_id null, note, created_at` — journal d'audit.

### cms_pages
`id, slug unique, title, excerpt, body (markdown), meta_title, meta_description, published_at`.

## 3. Règles d'intégrité
- Passage de commande dans une **transaction** avec `SELECT ... FOR UPDATE` sur les variantes.
- Stock décrémenté à la confirmation de paiement, restitué à l'annulation/remboursement.
- Transitions de statut validées par une machine à états (pas de saut arbitraire).
- Idempotence du webhook de paiement via `payment_reference` unique.

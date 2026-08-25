import {
  demoCategories,
  demoCollections,
  demoProducts,
  demoShippingZones,
} from "./demo-catalog";
import type {
  CartLine,
  CartQuote,
  Category,
  Collection,
  Product,
  ShippingZone,
  Variant,
} from "./types";
import type { CinetPayCheckoutData } from "./cinetpay";

/**
 * Client de l'API Laravel (/api/v1).
 *
 * - L'URL est fournie par VITE_API_BASE_URL
 *   (ex. https://api.duplika.com/api/v1).
 *
 * - Tant que l'API n'est pas déployée, le client bascule sur le catalogue de
 * démonstration local afin que le frontend reste testable de bout en bout.
 *
 * - Aucun calcul commercial définitif ne dépend de ce repli : dès que l'API
 * répond, c'est elle qui fait autorité (prix, remises, frais, stock, totaux).
 */

export const API_BASE_URL: string | undefined =
  import.meta.env["VITE_API_BASE_URL"];

export const USING_DEMO_DATA = !API_BASE_URL;

const AUTH_TOKEN_KEY = "duplika.auth.token";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function saveAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

interface LaravelUser {
  id: number | string;
  name: string;
  email: string;
}

interface LaravelAuthResponse {
  message: string;
  user: LaravelUser;
  token: string;
  token_type: string;
}

interface LaravelUserResponse {
  user: LaravelUser;
}

function normalizeAccountUser(user: LaravelUser): AccountUser {
  const parts = (user.name ?? "").trim().split(/\s+/);

  return {
    id: String(user.id),
    firstName: parts.shift() ?? "",
    lastName: parts.join(" "),
    email: user.email,
    phone: "",
  };
}

function normalizeProduct(raw: any): Product {
  const price = Number(raw.price ?? 0);
  const compareAtPrice =
    raw.compare_at_price != null
      ? Number(raw.compare_at_price)
      : undefined;

  const variant: Variant = {
    id: String(raw.id),
    sku: raw.sku ?? String(raw.id),
    options: {},
    price,
    compareAtPrice,
    stock: Number(raw.stock ?? 0),
    lowStockThreshold: Number(raw.low_stock_threshold ?? 3),
  };

  return {
    id: String(raw.id),
    slug: raw.slug,
    name: raw.name,
    sku: raw.sku ?? "",
    shortDescription: raw.short_description ?? "",
    description: raw.description ?? "",
    categorySlug: raw.category?.slug ?? "",
    collectionSlugs: [],
    media: raw.image
      ? [
          {
            id: `image-${raw.id}`,
            url: raw.image,
            alt: raw.name,
            type: "image",
          },
        ]
      : [],
    options: [],
    variants: [variant],
    sections: [],
    faq: [],
    attributes: {},
    relatedSlugs: [],
    addOnSlugs: [],
    rating:
      raw.rating_average != null
        ? {
            average: Number(raw.rating_average),
            count: Number(raw.rating_count ?? 0),
          }
        : undefined,
    isNew: Boolean(raw.is_new),
    publishedAt: raw.published_at ?? raw.created_at ?? "",
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (payload as { message?: string })?.message ??
        "Une erreur est survenue.",
      response.status,
      (payload as { errors?: Record<string, string[]> })?.errors,
    );
  }

  return (payload as { data?: T })?.data ?? (payload as T);
}
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Catalogue                                                          */
/* ------------------------------------------------------------------ */

export async function fetchCategories(): Promise<Category[]> {
  if (USING_DEMO_DATA) {
    await delay();
    return demoCategories;
  }

  return request<Category[]>("/categories");
}

export async function fetchCollections(): Promise<Collection[]> {
  if (USING_DEMO_DATA) {
    await delay();
    return demoCollections;
  }

  return request<Collection[]>("/collections");
}

export async function fetchProducts(): Promise<Product[]> {
  if (USING_DEMO_DATA) {
    await delay();
    return demoProducts;
  }

  const products = await request<any[]>("/products");
  return products.map(normalizeProduct);
}
export async function fetchProduct(
  slug: string,
): Promise<Product | null> {
  if (USING_DEMO_DATA) {
    await delay();
    return demoProducts.find((p) => p.slug === slug) ?? null;
  }

  const product = await request<any | null>(`/products/${slug}`);

  return product ? normalizeProduct(product) : null;
}
export async function fetchShippingZones(): Promise<ShippingZone[]> {
  if (USING_DEMO_DATA) {
    await delay();
    return demoShippingZones;
  }

  return request<ShippingZone[]>("/shipping/zones");
}

/* ------------------------------------------------------------------ */
/* Panier — le devis fait toujours autorité côté serveur              */
/* ------------------------------------------------------------------ */

export async function quoteCart(
  lines: CartLine[],
  shippingMethodId?: string,
): Promise<CartQuote> {
  if (USING_DEMO_DATA) {
    await delay(120);
    return localQuote(lines, shippingMethodId);
  }

  return request<CartQuote>("/cart/quote", {
    method: "POST",
    body: JSON.stringify({
      lines,
      shipping_method_id: shippingMethodId,
    }),
  });
}

export interface CheckoutPayload {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  address: {
    line1: string;
    line2?: string;
    city: string;
    zoneId: string;
    notes?: string;
  };

  shippingMethodId: string;

  paymentMethod: "cinetpay";

  lines: CartLine[];

  createAccount: boolean;
}

export interface CheckoutResult {
  reference: string;
  status: string;

  /**
   * URL de redirection vers le prestataire de paiement,
   * fournie par le backend.
   */
  paymentRedirectUrl: string | null;
  cinetpay: CinetPayCheckoutData;
}

export interface PaymentSyncResult {
  reference: string;
  status: string;
  paymentStatus: string | null;
}

export async function submitCheckout(
  payload: CheckoutPayload,
): Promise<CheckoutResult> {
  if (USING_DEMO_DATA) {
    await delay(400);

    const reference = `DPK-${Date.now()
      .toString(36)
      .toUpperCase()
      .slice(-6)}`;

    const createdAt = new Date().toISOString();

    const zone = demoShippingZones.find(
      (z) => z.id === payload.address.zoneId,
    );

    const method = demoShippingZones
      .flatMap((z) => z.methods)
      .find((m) => m.id === payload.shippingMethodId);

    const demoOrders = readDemoOrders();

    demoOrders[reference] = {
      reference,
      status: "en_attente_paiement",
      createdAt,
      email: payload.customer.email,
      quote: localQuote(
        payload.lines,
        payload.shippingMethodId,
      ),
      customer: payload.customer,
      address: {
        ...payload.address,
        zoneName: zone?.name ?? payload.address.zoneId,
      },
      shipping: method
        ? {
            methodName: method.name,
            delay: method.delay,
          }
        : null,
      events: [
        {
          at: createdAt,
          status: "en_attente_paiement",
          label: "Commande enregistrée, en attente de paiement.",
        },
      ],
    };

    writeDemoOrders(demoOrders);

    return {
      reference,
      status: "en_attente_paiement",
      paymentRedirectUrl: null,
      cinetpay: {
        apiKey: "demo",
        siteId: "demo",
        notifyUrl: "",
        mode: "TEST",
        closeAfterResponse: true,
        transactionId: reference.replace(/-/g, ""),
        amount: localQuote(payload.lines, payload.shippingMethodId).total,
        currency: "XOF",
        channels: "MOBILE_MONEY",
        description: `Paiement commande ${reference}`,
        metadata: reference,
        customer: {
          id: "demo",
          name: payload.customer.lastName,
          surname: payload.customer.firstName,
          email: payload.customer.email,
          phone: payload.customer.phone,
          address: payload.address.line1,
          city: payload.address.city,
          country: "TG",
        },
      },
    };
  }

  return request<CheckoutResult>("/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function syncCinetPayPayment(
  reference: string,
): Promise<PaymentSyncResult> {
  return request<PaymentSyncResult>(
    `/payments/cinetpay/${encodeURIComponent(reference)}/sync`,
    { method: "POST" },
  );
}

export interface OrderEvent {
  at: string;
  status: string;
  label: string;
}

export interface OrderAddress {
  line1: string;
  line2?: string | undefined;
  city: string;
  zoneId: string;
  zoneName?: string | undefined;
  notes?: string | undefined;
}

export interface OrderTracking {
  reference: string;
  status: string;
  createdAt: string;
  email: string;
  quote: CartQuote;

  customer?:
    | {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      }
    | undefined;

  address?: OrderAddress | undefined;

  shipping?:
    | {
        methodName: string;
        delay: string;
      }
    | null
    | undefined;

  trackingNumber?: string | undefined;
  trackingUrl?: string | undefined;
  carrier?: string | undefined;
  events?: OrderEvent[] | undefined;
}

export async function fetchOrder(
  reference: string,
  email?: string,
): Promise<OrderTracking | null> {
  if (USING_DEMO_DATA) {
    await delay();
    return readDemoOrders()[reference] ?? null;
  }

  const query = email
    ? `?email=${encodeURIComponent(email)}`
    : "";

  return request<OrderTracking | null>(
    `/orders/${reference}${query}`,
  );
}

/* ------------------------------------------------------------------ */
/* Repli local (démo uniquement)                                      */
/* ------------------------------------------------------------------ */

export function findVariant(
  product: Product,
  variantId: string,
): Variant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function variantLabel(
  product: Product,
  variant: Variant,
): string {
  return product.options
    .map((option) => {
      const value = option.values.find(
        (v) => v.id === variant.options[option.id],
      );

      return value
        ? `${option.name} : ${value.label}`
        : null;
    })
    .filter(Boolean)
    .join(" • ");
}

function localQuote(
  lines: CartLine[],
  shippingMethodId?: string,
): CartQuote {
  const quoteLines = lines.flatMap((line) => {
    const product = demoProducts.find(
      (p) => p.slug === line.productSlug,
    );

    const variant =
      product &&
      findVariant(product, line.variantId);

    if (!product || !variant) return [];

    const quantity = Math.min(
      line.quantity,
      Math.max(variant.stock, 0),
    );

    return [
      {
        productSlug: product.slug,
        variantId: variant.id,
        name: product.name,
        variantLabel: variantLabel(product, variant),
        image: product.media[0]?.url ?? "",
        unitPrice: variant.price,
        compareAtPrice: variant.compareAtPrice,
        quantity,
        lineTotal: variant.price * quantity,
        availableStock: variant.stock,
      },
    ];
  });

  const subtotal = quoteLines.reduce(
    (sum, l) => sum + l.lineTotal,
    0,
  );

  const method = demoShippingZones
    .flatMap((z) => z.methods)
    .find((m) => m.id === shippingMethodId);

  const shipping = method
    ? method.freeAbove && subtotal >= method.freeAbove
      ? 0
      : method.price
    : null;

  return {
    lines: quoteLines,
    subtotal,
    discount: 0,
    shipping,
    total: subtotal + (shipping ?? 0),
    currency: "XOF",
    warnings: quoteLines
      .filter((l) => l.availableStock === 0)
      .map(
        (l) =>
          `${l.name} est épuisé et a été retiré du total.`,
      ),
  };
}

const DEMO_ORDERS_KEY = "duplika.demo.orders";

function readDemoOrders(): Record<
  string,
  OrderTracking
> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      window.localStorage.getItem(DEMO_ORDERS_KEY) ?? "{}",
    );
  } catch {
    return {};
  }
}

function writeDemoOrders(
  orders: Record<string, OrderTracking>,
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    DEMO_ORDERS_KEY,
    JSON.stringify(orders),
  );
}

/* ------------------------------------------------------------------ */
/* Compte client (auth Sanctum côté Laravel)                           */
/* ------------------------------------------------------------------ */

export interface AccountUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AccountAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  phone: string;
  notes?: string;
  isDefault: boolean;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends Credentials {
  firstName: string;
  lastName: string;
  phone: string;
}

const DEMO_AUTH_KEY = "duplika.demo.auth";
const DEMO_ADDRESSES_KEY = "duplika.demo.addresses";

function readLocal<T>(
  key: string,
  fallback: T,
): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw
      ? (JSON.parse(raw) as T)
      : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(
  key: string,
  value: unknown,
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    key,
    JSON.stringify(value),
  );
}

export async function fetchMe(): Promise<AccountUser | null> {
  if (USING_DEMO_DATA) {
    await delay(80);

    return readLocal<AccountUser | null>(
      DEMO_AUTH_KEY,
      null,
    );
  }

  // Aucun token = utilisateur non connecté.
  if (!getAuthToken()) {
    return null;
  }

  try {
    const response =
      await request<LaravelUserResponse>("/user");

    return normalizeAccountUser(response.user);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401
    ) {
      removeAuthToken();
      return null;
    }

    throw error;
  }
}
export async function login(
  credentials: Credentials,
): Promise<AccountUser> {
  if (USING_DEMO_DATA) {
    await delay(300);

    const existing =
      readLocal<AccountUser | null>(
        DEMO_AUTH_KEY,
        null,
      );

    if (
      !existing ||
      existing.email.toLowerCase() !==
        credentials.email.toLowerCase()
    ) {
      throw new ApiError(
        "Identifiants incorrects.",
        422,
      );
    }

    return existing;
  }

  const response =
    await request<LaravelAuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

  saveAuthToken(response.token);

  return normalizeAccountUser(response.user);
}
export async function register(
  payload: RegisterPayload,
): Promise<AccountUser> {
  if (USING_DEMO_DATA) {
    await delay(350);

    const user: AccountUser = {
      id: `demo-${Date.now().toString(36)}`,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
    };

    writeLocal(DEMO_AUTH_KEY, user);

    return user;
  }

  const response =
    await request<LaravelAuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({
        name: `${payload.firstName} ${payload.lastName}`.trim(),
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.password,
      }),
    });

  saveAuthToken(response.token);

  return {
    ...normalizeAccountUser(response.user),
    phone: payload.phone,
  };
}
export async function logout(): Promise<void> {
  if (USING_DEMO_DATA) {
    await delay(120);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(
        DEMO_AUTH_KEY,
      );
    }

    return;
  }

  try {
    if (getAuthToken()) {
      await request("/logout", {
        method: "POST",
      });
    }
  } finally {
    removeAuthToken();
  }
}
export async function requestPasswordReset(
  email: string,
): Promise<void> {
  if (USING_DEMO_DATA) {
    await delay(300);
    return;
  }

  await request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function updateProfile(
  payload: Omit<AccountUser, "id">,
): Promise<AccountUser> {
  if (USING_DEMO_DATA) {
    await delay(250);

    const existing =
      readLocal<AccountUser | null>(
        DEMO_AUTH_KEY,
        null,
      );

    const user: AccountUser = {
      id: existing?.id ?? "demo",
      ...payload,
    };

    writeLocal(DEMO_AUTH_KEY, user);

    return user;
  }

  return request<AccountUser>("/me/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchAddresses(): Promise<
  AccountAddress[]
> {
  if (USING_DEMO_DATA) {
    await delay(150);

    return readLocal<AccountAddress[]>(
      DEMO_ADDRESSES_KEY,
      [],
    );
  }

  return request<AccountAddress[]>(
    "/me/addresses",
  );
}

export async function createAddress(
  payload: Omit<AccountAddress, "id">,
): Promise<AccountAddress> {
  if (USING_DEMO_DATA) {
    await delay(200);

    const address: AccountAddress = {
      id: `adr-${Date.now()
        .toString(36)}`,
      ...payload,
    };

    const list =
      readLocal<AccountAddress[]>(
        DEMO_ADDRESSES_KEY,
        [],
      );

    const next = address.isDefault
      ? [
          ...list.map((a) => ({
            ...a,
            isDefault: false,
          })),
          address,
        ]
      : [...list, address];

    writeLocal(
      DEMO_ADDRESSES_KEY,
      next,
    );

    return address;
  }

  return request<AccountAddress>(
    "/me/addresses",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteAddress(
  id: string,
): Promise<void> {
  if (USING_DEMO_DATA) {
    await delay(150);

    writeLocal(
      DEMO_ADDRESSES_KEY,
      readLocal<AccountAddress[]>(
        DEMO_ADDRESSES_KEY,
        [],
      ).filter((a) => a.id !== id),
    );

    return;
  }

  await request(
    `/me/addresses/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function fetchMyOrders(): Promise<
  OrderTracking[]
> {
  if (USING_DEMO_DATA) {
    await delay(200);

    const me =
      readLocal<AccountUser | null>(
        DEMO_AUTH_KEY,
        null,
      );

    const orders =
      Object.values(readDemoOrders());

    return me
      ? orders.filter(
          (o) =>
            o.email.toLowerCase() ===
            me.email.toLowerCase(),
        )
      : [];
  }

  return request<OrderTracking[]>(
    "/me/orders",
  );
}

/* ------------------------------------------------------------------ */
/* SmartMatch                                                         */
/* ------------------------------------------------------------------ */

export interface SmartMatchCriteria {
  wig_type?: string;
  texture?: string;
  color?: string;
  length?: string;
  style?: string;
  occasion?: string;
  budget: number;
}

export interface SmartMatchResult {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  image: string | null;
  wig_type: string | null;
  texture: string | null;
  color: string | null;
  length: string | null;
  style: string | null;
  occasion: string | null;
  smartmatch_score: number;
}

export async function fetchSmartMatch(
  criteria: SmartMatchCriteria,
): Promise<SmartMatchResult[]> {
  return request<SmartMatchResult[]>("/smartmatch", {
    method: "POST",
    body: JSON.stringify(criteria),
  });
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function sendContactMessage(
  payload: ContactMessagePayload,
): Promise<void> {
  await request("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface NewsletterSubscribeResponse {
  message: string;
}

export async function subscribeNewsletter(
  email: string,
): Promise<NewsletterSubscribeResponse> {
  return request<NewsletterSubscribeResponse>(
    "/newsletter/subscribe",
    {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    },
  );
}

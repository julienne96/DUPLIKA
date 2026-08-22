import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Minus, Plus, ShieldCheck, Truck, Clock } from "lucide-react";

import { getProductImage } from "@/lib/product-images";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { fetchProduct, fetchProducts } from "@/lib/api";
import { discountPercent, formatPrice } from "@/lib/format";
import { StockBadge } from "@/components/shop/StockBadge";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProduct(params.slug);

    if (!product) {
      throw notFound();
    }

    return product;
  },

  head: ({ loaderData }: { loaderData?: Product | undefined }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.name} | DUPLIKA`,
          },
          {
            name: "description",
            content: loaderData.shortDescription,
          },
          {
            property: "og:title",
            content: `${loaderData.name} | DUPLIKA`,
          },
          {
            property: "og:description",
            content: loaderData.shortDescription,
          },
        ]
      : [],
  }),

  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData() as Product;
  const cart = useCart();

  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.options.map((option) => [
        option.id,
        option.values[0]?.id ?? "",
      ]),
    ),
  );

  const [quantity, setQuantity] = useState(1);
  const [activeMedia, setActiveMedia] = useState(0);

  const variant = useMemo(() => {
    const selectedVariant = product.variants.find((variant) =>
      product.options.every(
        (option) => variant.options[option.id] === selection[option.id],
      ),
    );

    return selectedVariant ?? product.variants[0];
  }, [product, selection]);

  const { data: all } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const related = (all ?? []).filter((item) =>
    product.relatedSlugs.includes(item.slug),
  );

  const addOns = (all ?? []).filter((item) =>
    product.addOnSlugs.includes(item.slug),
  );

 

  const currentMedia = product.media?.[activeMedia];

  const mainImage = getProductImage(
  product.slug,
  currentMedia?.url,
);

  const mainImageAlt =
    currentMedia?.alt ??
    product.name;

  /*
   * Sécurité supplémentaire :
   * normalement chaque produit possède au moins une variante.
   */
  if (!variant) {
    return (
      <div className="container-duplika py-16 text-center">
        <h1 className="text-3xl">
          Produit momentanément indisponible
        </h1>

        <p className="mt-3 text-muted-foreground">
          Aucune variante n'est disponible pour ce produit.
        </p>

        <Button asChild className="mt-6">
          <Link to="/boutique">
            Retour à la boutique
          </Link>
        </Button>
      </div>
    );
  }

  const promo = discountPercent(
    variant.price,
    variant.compareAtPrice,
  );

  const outOfStock = variant.stock <= 0;
  const maxQuantity = Math.max(variant.stock, 1);

  const addToCart = () => {
    if (outOfStock) {
      return;
    }

    cart.addLine({
      productSlug: product.slug,
      variantId: variant.id,
      quantity,
    });

    toast.success(
      `${product.name} ajouté au panier.`,
    );
  };

  return (
    <div className="container-duplika py-8">
      {/* FIL D'ARIANE */}

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">
                Accueil
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/boutique"
                search={{
                  categorie: product.categorySlug,
                }}
              >
                Boutique
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>
              {product.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* PRODUIT */}

      <div className="grid gap-10 lg:grid-cols-2">
        {/* IMAGES */}

        <div className="space-y-3">
          <img
            src={mainImage}
            alt={mainImageAlt}
            width={1024}
            height={1280}
            className="aspect-[4/5] w-full rounded-lg bg-secondary object-cover"
          />

          {product.media?.length > 1 ? (
            <div className="flex gap-2">
              {product.media.map((media, index) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() =>
                    setActiveMedia(index)
                  }
                  aria-label={`Voir l'image ${index + 1}`}
                  aria-current={
                    index === activeMedia
                  }
                  className={cn(
                    "overflow-hidden rounded border-2",
                    index === activeMedia
                      ? "border-primary"
                      : "border-transparent",
                  )}
                >
                  <img
                    src={media.url}
                    alt={media.alt || product.name}
                    width={80}
                    height={100}
                    loading="lazy"
                    className="size-20 object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* INFORMATIONS PRODUIT */}

        <div>
          <div className="flex flex-wrap gap-2">
            {product.isNew ? (
              <StockBadge tone="new" />
            ) : null}

            {promo ? (
              <StockBadge tone="promo">
                -{promo} %
              </StockBadge>
            ) : null}

            {outOfStock ? (
              <StockBadge tone="out" />
            ) : variant.stock <=
              variant.lowStockThreshold ? (
              <StockBadge tone="low">
                Plus que {variant.stock} en stock
              </StockBadge>
            ) : null}
          </div>

          <h1 className="mt-3 text-4xl sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Réf. {variant.sku}
          </p>

          {product.rating ? (
            <p className="mt-2 text-sm text-muted-foreground">
              ★{" "}
              {product.rating.average.toFixed(1)}
              {" · "}
              {product.rating.count} avis
            </p>
          ) : null}

          {/* PRIX */}

          <p className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl">
              {formatPrice(variant.price)}
            </span>

            {variant.compareAtPrice ? (
              <span className="text-muted-foreground line-through">
                {formatPrice(
                  variant.compareAtPrice,
                )}
              </span>
            ) : null}
          </p>

          <p className="mt-4 text-muted-foreground">
            {product.shortDescription}
          </p>

          {/* OPTIONS / VARIANTES */}

          {product.options.map((option) => (
            <fieldset
              key={option.id}
              className="mt-6"
            >
              <legend className="eyebrow mb-2 text-muted-foreground">
                {option.name}
              </legend>

              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const selected =
                    selection[option.id] ===
                    value.id;

                  return (
                    <button
                      key={value.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelection(
                          (previous) => ({
                            ...previous,
                            [option.id]:
                              value.id,
                          }),
                        );

                        setQuantity(1);
                      }}
                      className={cn(
                        "min-w-14 rounded-md border px-3 py-2 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary",
                      )}
                    >
                      {value.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {/* QUANTITÉ + PANIER */}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <button
                type="button"
                aria-label="Diminuer la quantité"
                className="p-2.5 hover:bg-secondary disabled:opacity-40"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                  )
                }
              >
                <Minus className="size-4" />
              </button>

              <span
                className="w-10 text-center text-sm"
                aria-live="polite"
              >
                {quantity}
              </span>

              <button
                type="button"
                aria-label="Augmenter la quantité"
                className="p-2.5 hover:bg-secondary disabled:opacity-40"
                disabled={
                  quantity >= maxQuantity ||
                  outOfStock
                }
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(
                      maxQuantity,
                      current + 1,
                    ),
                  )
                }
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              onClick={addToCart}
              disabled={outOfStock}
            >
              {outOfStock
                ? "Épuisé"
                : "Ajouter au panier"}
            </Button>
          </div>

          {/* ACHETER MAINTENANT */}

          <Button
            asChild={!outOfStock}
            size="lg"
            variant="outline"
            className="mt-3 w-full"
            disabled={outOfStock}
            onClick={() => {
              if (!outOfStock) {
                cart.addLine({
                  productSlug:
                    product.slug,
                  variantId:
                    variant.id,
                  quantity,
                });

                cart.close();
              }
            }}
          >
            {outOfStock ? (
              <span>
                Indisponible
              </span>
            ) : (
              <Link to="/checkout">
                Acheter maintenant
              </Link>
            )}
          </Button>

          {/* INFORMATIONS LIVRAISON */}

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Truck
                className="size-4 text-primary"
                aria-hidden
              />

              Suivez vos livraison 
              
            </li>

            <li className="flex gap-2">
              <Clock
                className="size-4 text-primary"
                aria-hidden
              />

              Préparation sous 24 à 48 h ouvrées
            </li>

            <li className="flex gap-2">
              <ShieldCheck
                className="size-4 text-primary"
                aria-hidden
              />

              Retour sous 7 jours si la pièce
              n'a pas été portée
            </li>
          </ul>

          {/* DESCRIPTION */}

          <Accordion
            type="single"
            collapsible
            className="mt-8"
          >
            {product.sections.map(
              (section) => (
                <AccordionItem
                  key={section.title}
                  value={section.title}
                >
                  <AccordionTrigger>
                    {section.title}
                  </AccordionTrigger>

                  <AccordionContent className="text-muted-foreground">
                    {section.content}
                  </AccordionContent>
                </AccordionItem>
              ),
            )}

            {Object.keys(
              product.attributes,
            ).length > 0 ? (
              <AccordionItem value="attributs">
                <AccordionTrigger>
                  Fiche technique
                </AccordionTrigger>

                <AccordionContent>
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    {Object.entries(
                      product.attributes,
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="contents"
                      >
                        <dt className="text-muted-foreground">
                          {key}
                        </dt>

                        <dd>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            ) : null}

            {product.faq.map((item) => (
              <AccordionItem
                key={item.question}
                value={item.question}
              >
                <AccordionTrigger>
                  {item.question}
                </AccordionTrigger>

                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* PRODUITS COMPLÉMENTAIRES */}

      {addOns.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-3xl">
            Complétez votre routine
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {addOns.map((item) => (
              <ProductCard
                key={item.slug}
                product={item}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* PRODUITS SIMILAIRES */}

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-3xl">
            Vous aimerez aussi
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.slug}
                product={item}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <Skeleton className="h-96 w-full" />
  );
}
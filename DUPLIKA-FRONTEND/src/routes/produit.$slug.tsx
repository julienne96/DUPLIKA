import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  Clock,
  Star,
} from "lucide-react";

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

import {
  ApiError,
  createProductReview,
  fetchProduct,
  fetchProductReviews,
  fetchProducts,
} from "@/lib/api";
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

  const queryClient = useQueryClient();

const [reviewRating, setReviewRating] = useState(0);
const [reviewComment, setReviewComment] = useState("");

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

const {
  data: reviews = [],
  isLoading: reviewsLoading,
} = useQuery({
  queryKey: ["product-reviews", product.id],
  queryFn: () => fetchProductReviews(product.id),
});

const reviewMutation = useMutation({
  mutationFn: () =>
    createProductReview(product.id, {
      rating: reviewRating,
     ...(reviewComment.trim()
  ? { comment: reviewComment.trim() }
  : {}),
    }),

  onSuccess: async () => {
    toast.success("Votre avis a bien été publié.");

    setReviewRating(0);
    setReviewComment("");

    await queryClient.invalidateQueries({
      queryKey: ["product-reviews", product.id],
    });

    await queryClient.invalidateQueries({
      queryKey: ["products"],
    });
  },

  onError: (error) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
      return;
    }

    toast.error(
      "Impossible de publier votre avis pour le moment.",
    );
  },
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

            {/* AVIS CLIENTS */}

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl">
              Avis clients
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Avis laissés par des clientes ayant acheté ce produit.
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  const average =
                    reviews.reduce(
                      (total, review) =>
                        total + review.rating,
                      0,
                    ) / reviews.length;

                  return (
                    <Star
                      key={star}
                      className={cn(
                        "size-5",
                        star <= Math.round(average)
                          ? "fill-current text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  );
                })}
              </div>

              <span className="text-sm font-medium">
                {(
                  reviews.reduce(
                    (total, review) =>
                      total + review.rating,
                    0,
                  ) / reviews.length
                ).toFixed(1)}
                /5
              </span>

              <span className="text-sm text-muted-foreground">
                ({reviews.length}{" "}
                {reviews.length > 1 ? "avis" : "avis"})
              </span>
            </div>
          ) : null}
        </div>

        {/* FORMULAIRE */}

        <div className="mt-8 rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold">
            Donnez votre avis
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Vous devez avoir acheté ce produit pour publier un avis.
          </p>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium">
              Votre note
            </p>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                  onClick={() => setReviewRating(star)}
                  className="rounded p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      star <= reviewRating
                        ? "fill-current text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="review-comment"
              className="text-sm font-medium"
            >
              Votre commentaire
            </label>

            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={(event) =>
                setReviewComment(event.target.value)
              }
              maxLength={1500}
              rows={4}
              placeholder="Que pensez-vous de ce produit ?"
              className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
            />

            <p className="mt-1 text-right text-xs text-muted-foreground">
              {reviewComment.length}/1500
            </p>
          </div>

          <Button
            type="button"
            className="mt-4"
            disabled={
              reviewRating === 0 ||
              reviewMutation.isPending
            }
            onClick={() => reviewMutation.mutate()}
          >
            {reviewMutation.isPending
              ? "Publication..."
              : "Publier mon avis"}
          </Button>
        </div>

        {/* LISTE DES AVIS */}

        <div className="mt-8">
          {reviewsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="font-medium">
                Aucun avis pour le moment
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Soyez la première cliente à donner votre avis sur ce produit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-border p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {review.user.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Achat vérifié
                      </p>
                    </div>

                    <div
                      className="flex"
                      aria-label={`${review.rating} étoiles sur 5`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "size-4",
                            star <= review.rating
                              ? "fill-current text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment ? (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {review.comment}
                    </p>
                  ) : null}

                  {review.reviewed_at ? (
                    <time
                      className="mt-3 block text-xs text-muted-foreground"
                      dateTime={review.reviewed_at}
                    >
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }).format(
                        new Date(review.reviewed_at),
                      )}
                    </time>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

    

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

import { Link } from "@tanstack/react-router";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { StockBadge } from "./StockBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductImage } from "@/lib/product-images";

export function productPriceRange(product: Product) {
  const prices = product.variants.map((v) => v.price);
  const min = prices.length ? Math.min(...prices) : 0;
  const cheapest = product.variants.find((v) => v.price === min);

  return {
    min,
    compareAt: cheapest?.compareAtPrice,
  };
}

export function totalStock(product: Product) {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function ProductCard({ product }: { product: Product }) {
  const { min, compareAt } = productPriceRange(product);
  const stock = totalStock(product);
  const promo = discountPercent(min, compareAt);
  const lowThreshold =
    product.variants[0]?.lowStockThreshold ?? 3;

  return (
    <article className="group">
      <Link
        to="/produit/$slug"
        params={{ slug: product.slug }}
        className="block focus-visible:outline-offset-4"
      >
        <div className="relative overflow-hidden rounded-lg bg-secondary">
          <img
            src={getProductImage(
  product.slug,
  product.media?.[0]?.url,
)}
            alt={product.media[0]?.alt || product.name}
            width={1024}
            height={1280}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.isNew ? <StockBadge tone="new" /> : null}

            {promo ? (
              <StockBadge tone="promo">
                -{promo} %
              </StockBadge>
            ) : null}

            {stock === 0 ? (
              <StockBadge tone="out" />
            ) : stock <= lowThreshold ? (
              <StockBadge tone="low" />
            ) : null}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="font-display text-xl leading-snug">
            {product.name}
          </h3>

          <p className="line-clamp-1 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>

          <p className="flex items-baseline gap-2 pt-0.5 text-sm">
            <span className="font-medium">
              {product.variants.length > 1 ? "À partir de " : ""}
              {formatPrice(min)}
            </span>

            {compareAt ? (
              <span className="text-muted-foreground line-through">
                {formatPrice(compareAt)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

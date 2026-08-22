import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Minus,
  Plus,
  Trash2,
  LockKeyhole,
} from "lucide-react";

import { getProductImage } from "@/lib/product-images";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import { useCart } from "@/lib/cart";
import { quoteCart } from "@/lib/api";
import { formatPrice } from "@/lib/format";



export function CartDrawer() {
  const cart = useCart();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cart-quote", cart.lines],
    queryFn: () => quoteCart(cart.lines),
    enabled:
      cart.hydrated &&
      cart.lines.length > 0,
  });

  return (
    <Sheet
      open={cart.isOpen}
      onOpenChange={(open) =>
        open ? cart.open() : cart.close()
      }
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl"
      >
        {/* HEADER */}

        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-display text-3xl">
            Votre panier
          </SheetTitle>

          <p className="text-sm text-muted-foreground">
            {cart.count} article
            {cart.count > 1 ? "s" : ""}
          </p>
        </SheetHeader>

        {/* CONTENU */}

        <div className="flex-1 overflow-y-auto px-6">
          {cart.lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Votre panier est vide.
              </p>

              <Button
                asChild
                variant="outline"
                className="mt-4"
                onClick={cart.close}
              >
                <Link to="/boutique">
                  Découvrir la boutique
                </Link>
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-4 py-5">
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 w-full"
                />
              ))}
            </div>
          ) : isError ? (
            <Alert
              variant="destructive"
              className="my-5"
            >
              <AlertDescription>
                Impossible de calculer votre
                panier pour le moment.
                Réessayez dans un instant.
              </AlertDescription>
            </Alert>
          ) : (
            <ul className="divide-y divide-border">
              {data?.lines.map((line) => (
                <li
                  key={`${line.productSlug}-${line.variantId}`}
                  className="grid grid-cols-[96px_1fr_auto] gap-4 py-5"
                >
                  {/* IMAGE */}

                  <Link
                    to="/produit/$slug"
                    params={{
                      slug: line.productSlug,
                    }}
                    onClick={cart.close}
                    className="block"
                  >
                    <img
                      src={getProductImage(
  line.productSlug,
  line.image,
)}
                      alt={line.name}
                      width={96}
                      height={120}
                      loading="lazy"
                      className="h-28 w-24 rounded-md bg-secondary object-cover"
                    />
                  </Link>

                  {/* INFOS */}

                  <div className="min-w-0">
                    <Link
                      to="/produit/$slug"
                      params={{
                        slug: line.productSlug,
                      }}
                      onClick={cart.close}
                      className="block font-medium leading-snug hover:text-primary"
                    >
                      {line.name}
                    </Link>

                    {line.variantLabel ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {line.variantLabel}
                      </p>
                    ) : null}

                    <div className="mt-4 flex items-center gap-3">
                      {/* QUANTITÉ */}

                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label="Diminuer la quantité"
                          className="p-2 hover:bg-secondary"
                          onClick={() =>
                            cart.setQuantity(
                              line.variantId,
                              line.productSlug,
                              line.quantity - 1,
                            )
                          }
                        >
                          <Minus className="size-4" />
                        </button>

                        <span className="w-9 text-center text-sm">
                          {line.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label="Augmenter la quantité"
                          disabled={
                            line.quantity >=
                            line.availableStock
                          }
                          className="p-2 hover:bg-secondary disabled:opacity-40"
                          onClick={() =>
                            cart.setQuantity(
                              line.variantId,
                              line.productSlug,
                              line.quantity + 1,
                            )
                          }
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>

                      {/* SUPPRIMER */}

                      <button
                        type="button"
                        aria-label={`Retirer ${line.name}`}
                        className="p-2 text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() =>
                          cart.removeLine(
                            line.variantId,
                            line.productSlug,
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* PRIX */}

                  <p className="whitespace-nowrap text-sm font-semibold">
                    {formatPrice(
                      line.lineTotal,
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {data?.warnings.map((warning) => (
            <Alert
              key={warning}
              className="my-3"
            >
              <AlertDescription>
                {warning}
              </AlertDescription>
            </Alert>
          ))}
        </div>

        {/* RÉCAPITULATIF */}

        {cart.lines.length > 0 ? (
          <div className="border-t border-border bg-background px-6 py-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-6">
                <span className="text-sm text-muted-foreground">
                  Sous-total
                </span>

                <span className="whitespace-nowrap font-semibold">
                  {formatPrice(
                    data?.subtotal ?? 0,
                  )}
                </span>
              </div>

              <div className="flex items-start justify-between gap-6">
                <span className="text-sm text-muted-foreground">
                  Frais de livraison
                </span>

                <span className="max-w-[220px] text-right text-sm">
                  Calculés à l’étape suivante
                </span>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between gap-6">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="whitespace-nowrap text-lg font-semibold text-primary">
                    {formatPrice(
                      data?.total ?? 0,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* BOUTONS */}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                asChild
                size="lg"
                onClick={cart.close}
              >
                <Link to="/checkout">
                  Passer commande
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                onClick={cart.close}
              >
                <Link to="/panier">
                  Voir le panier
                </Link>
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="size-4" />
              Paiement 100% sécurisé
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
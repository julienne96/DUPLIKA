import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCart } from "@/lib/cart";
import { quoteCart } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Votre panier | DUPLIKA" },
      { name: "description", content: "Vérifiez vos articles avant de finaliser votre commande DUPLIKA." },
      { property: "og:title", content: "Votre panier | DUPLIKA" },
      { property: "og:description", content: "Vérifiez vos articles avant de finaliser votre commande." },
    ],
  }),
  component: PanierPage,
});

function PanierPage() {
  const cart = useCart();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cart-quote", cart.lines],
    queryFn: () => quoteCart(cart.lines),
    enabled: cart.hydrated && cart.lines.length > 0,
  });

  return (
    <div className="container-duplika py-10">
      <h1 className="text-4xl sm:text-5xl">Votre panier</h1>

      {cart.hydrated && cart.lines.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border py-20 text-center">
          <p className="font-display text-2xl">Votre panier est vide</p>
          <Button asChild className="mt-5">
            <Link to="/boutique">Découvrir la boutique</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            {isError ? (
              <Alert variant="destructive">
                <AlertDescription>Le calcul du panier a échoué. Réessayez dans un instant.</AlertDescription>
              </Alert>
            ) : isLoading || !cart.hydrated ? (
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {data?.lines.map((line) => (
                  <li key={`${line.productSlug}-${line.variantId}`} className="flex gap-4 py-5">
                    <img
                      src={line.image}
                      alt=""
                      width={112}
                      height={140}
                      loading="lazy"
                      className="size-28 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/produit/$slug"
                        params={{ slug: line.productSlug }}
                        className="font-display text-xl hover:text-primary"
                      >
                        {line.name}
                      </Link>
                      {line.variantLabel ? (
                        <p className="mt-0.5 text-sm text-muted-foreground">{line.variantLabel}</p>
                      ) : null}
                      <p className="mt-1 text-sm">{formatPrice(line.unitPrice)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            type="button"
                            aria-label="Diminuer la quantité"
                            className="p-2 hover:bg-secondary"
                            onClick={() => cart.setQuantity(line.variantId, line.productSlug, line.quantity - 1)}
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-9 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Augmenter la quantité"
                            disabled={line.quantity >= line.availableStock}
                            className="p-2 hover:bg-secondary disabled:opacity-40"
                            onClick={() => cart.setQuantity(line.variantId, line.productSlug, line.quantity + 1)}
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                          onClick={() => cart.removeLine(line.variantId, line.productSlug)}
                        >
                          <Trash2 className="size-4" /> Retirer
                        </button>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(line.lineTotal)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl">Récapitulatif</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd>{formatPrice(data?.subtotal ?? 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Livraison</dt>
                <dd className="text-muted-foreground">Calculée au checkout</dd>
              </div>
            </dl>
            <Button asChild size="lg" className="mt-5 w-full">
              <Link to="/checkout">Passer commande</Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Les montants définitifs sont recalculés et validés par notre serveur avant paiement.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

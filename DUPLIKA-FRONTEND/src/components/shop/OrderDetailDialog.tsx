import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchOrder } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  en_attente_paiement: "En attente de paiement",
  payee: "Payée",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
  remboursee: "Remboursée",
};

const STEPS = [
  "en_attente_paiement",
  "payee",
  "en_preparation",
  "expediee",
  "livree",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

interface Props {
  reference: string | null;
  email?: string | undefined;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({
  reference,
  email,
  onOpenChange,
}: Props) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["order", reference, email ?? null],
    queryFn: () => fetchOrder(reference!, email),
    enabled: Boolean(reference),
  });

  const currentStep = data
    ? STEPS.indexOf(data.status)
    : -1;

  const shippingMethod =
    data?.shipping?.methodName ?? "";

  const isHomeDelivery =
    shippingMethod
      .toLowerCase()
      .includes("livraison");

  const isPickup =
    shippingMethod
      .toLowerCase()
      .includes("retrait");

  return (
    <Dialog
      open={Boolean(reference)}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Commande {reference}
          </DialogTitle>

          <DialogDescription>
            Détail des articles, de la réception et du suivi.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : null}

        {!isLoading && (isError || !data) ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Impossible de charger le détail de cette commande.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching
                ? "Chargement…"
                : "Réessayer"}
            </Button>
          </div>
        ) : null}

        {data ? (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Passée le {formatDate(data.createdAt)}
              </p>

              <span className="eyebrow rounded-full bg-secondary px-3 py-1">
                {ORDER_STATUS_LABELS[data.status] ??
                  data.status}
              </span>
            </div>

            {/* Suivi */}
            <section>
              <h3 className="font-display text-lg">
                Suivi
              </h3>

              <ol className="mt-3 grid gap-2 sm:grid-cols-5">
                {STEPS.map((step, index) => {
                  const done =
                    currentStep >= index &&
                    currentStep >= 0;

                  return (
                    <li
                      key={step}
                      className="text-xs"
                    >
                      <div
                        className={
                          done
                            ? "h-1 rounded bg-primary"
                            : "h-1 rounded bg-border"
                        }
                      />

                      <p
                        className={
                          done
                            ? "mt-2 font-medium"
                            : "mt-2 text-muted-foreground"
                        }
                      >
                        {ORDER_STATUS_LABELS[step]}
                      </p>
                    </li>
                  );
                })}
              </ol>

              {data.trackingNumber ? (
                <p className="mt-3 text-sm">
                  Colis{" "}
                  {data.carrier
                    ? `${data.carrier} `
                    : ""}
                  n° {data.trackingNumber}

                  {data.trackingUrl ? (
                    <>
                      {" · "}

                      <a
                        className="underline underline-offset-4"
                        href={data.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Suivre le colis
                      </a>
                    </>
                  ) : null}
                </p>
              ) : null}
            </section>

            {/* Articles */}
            <section>
              <h3 className="font-display text-lg">
                Articles
              </h3>

              <ul className="mt-3 divide-y divide-border border-y border-border">
                {data.quote.lines.map((line) => (
                  <li
                    key={`${line.productSlug}-${line.variantId}`}
                    className="flex items-center gap-4 py-4 text-sm"
                  >
                    <img
                      src={getProductImage(
                        line.productSlug,
                        line.image,
                      )}
                      alt={line.name}
                      loading="lazy"
                      className="h-20 w-16 shrink-0 rounded-md bg-secondary object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {line.name}
                      </p>

                      {line.variantLabel ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {line.variantLabel}
                        </p>
                      ) : null}

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatPrice(
                          line.unitPrice,
                        )}{" "}
                        × {line.quantity}
                      </p>
                    </div>

                    <span className="shrink-0 font-medium">
                      {formatPrice(
                        line.lineTotal,
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    Sous-total
                  </dt>

                  <dd>
                    {formatPrice(
                      data.quote.subtotal,
                    )}
                  </dd>
                </div>

                {data.quote.discount > 0 ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                      Remise
                    </dt>

                    <dd>
                      −
                      {formatPrice(
                        data.quote.discount,
                      )}
                    </dd>
                  </div>
                ) : null}

                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    Livraison
                  </dt>

                  <dd className="text-right">
                    {isHomeDelivery
                      ? "À définir via WhatsApp"
                      : isPickup
                        ? "Retrait à la boutique"
                        : "À définir"}
                  </dd>
                </div>

                <div className="flex justify-between gap-4 border-t border-border pt-3 font-medium">
                  <dt>Total produits</dt>

                  <dd>
                    {formatPrice(
                      data.quote.total,
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Réception / coordonnées */}
            {data.address ||
            data.customer ||
            data.shipping ? (
              <section className="grid gap-6 sm:grid-cols-2">
                {data.address ? (
                  <div>
                    <h3 className="font-display text-lg">
                      {isPickup
                        ? "Retrait à la boutique"
                        : "Informations de livraison"}
                    </h3>

                    <div className="mt-2 text-sm not-italic text-muted-foreground">
                      {data.customer ? (
                        <p className="font-medium text-foreground">
                          {
                            data.customer
                              .firstName
                          }{" "}
                          {
                            data.customer
                              .lastName
                          }
                        </p>
                      ) : null}

                      {isPickup ? (
                        <>
                          <p className="mt-2">
                            Boutique DUPLIKA
                          </p>

                          <p>
                            Agoè Cacavéli
                          </p>

                          <p>
                            Marché Dekawowo Simé
                          </p>

                          <p>
                            Lomé, Togo
                          </p>
                        </>
                      ) : (
                        <>
                          {data.address.line1 ? (
                            <p className="mt-2">
                              {
                                data.address
                                  .line1
                              }
                            </p>
                          ) : null}

                          {data.address.line2 ? (
                            <p>
                              {
                                data.address
                                  .line2
                              }
                            </p>
                          ) : null}

                          {data.address.city ? (
                            <p>
                              {
                                data.address
                                  .city
                              }
                            </p>
                          ) : null}

                          {data.address.notes ? (
                            <p className="mt-2 italic">
                              {
                                data.address
                                  .notes
                              }
                            </p>
                          ) : null}
                        </>
                      )}

                      {data.customer?.phone ? (
                        <p className="mt-2">
                          Tél.{" "}
                          {
                            data.customer
                              .phone
                          }
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {data.shipping ? (
                  <div>
                    <h3 className="font-display text-lg">
                      Mode de réception
                    </h3>

                    <p className="mt-2 text-sm font-medium">
                      {data.shipping.methodName}
                    </p>

                    {isHomeDelivery ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Le tarif et les modalités
                        de livraison sont convenus
                        directement avec l'équipe
                        DUPLIKA via WhatsApp.
                      </p>
                    ) : data.shipping.delay ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {data.shipping.delay}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* Événements */}
            {data.events &&
            data.events.length > 0 ? (
              <section>
                <h3 className="font-display text-lg">
                  Historique
                </h3>

                <ol className="mt-3 space-y-3 border-l border-border pl-4">
                  {[...data.events]
                    .sort(
                      (a, b) =>
                        new Date(
                          b.at,
                        ).getTime() -
                        new Date(
                          a.at,
                        ).getTime(),
                    )
                    .map(
                      (event, index) => (
                        <li
                          key={`${event.at}-${index}`}
                          className="relative text-sm"
                        >
                          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />

                          <p className="font-medium">
                            {ORDER_STATUS_LABELS[
                              event.status
                            ] ??
                              event.status}
                          </p>

                          <p className="text-muted-foreground">
                            {event.label}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {formatDate(
                              event.at,
                            )}
                          </p>
                        </li>
                      ),
                    )}
                </ol>
              </section>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
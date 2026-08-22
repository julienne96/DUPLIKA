import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

import {
  Check,
  Clock3,
  PackageCheck,
  PackageOpen,
  Search,
  ShoppingBag,
  Store,
  Truck,
  User,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { fetchOrder } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/suivi")({
  validateSearch: z.object({
    ref: z.string().optional(),
  }),

  head: () => ({
    meta: [
      {
        title: "Suivre ma commande | DUPLIKA",
      },
      {
        name: "description",
        content:
          "Consultez l'état de votre commande DUPLIKA avec votre référence.",
      },
    ],
  }),

  component: SuiviPage,
});

const STATUS_LABELS: Record<string, string> = {
  en_attente_paiement: "Commande reçue",
  payee: "Confirmée",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Terminée",
  annulee: "Annulée",
  remboursee: "Remboursée",
};

const STEPS = [
  {
    status: "en_attente_paiement",
    label: "Commande reçue",
    icon: ShoppingBag,
  },
  {
    status: "payee",
    label: "Confirmée",
    icon: Check,
  },
  {
    status: "en_preparation",
    label: "En préparation",
    icon: PackageOpen,
  },
  {
    status: "expediee",
    label: "Prête / Expédiée",
    icon: Truck,
  },
  {
    status: "livree",
    label: "Terminée",
    icon: PackageCheck,
  },
];

function SuiviPage() {
  const { ref } = Route.useSearch();

  const [input, setInput] = useState(
    ref ?? "",
  );

  const [reference, setReference] =
    useState(ref ?? "");

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", reference],
    queryFn: () => fetchOrder(reference),
    enabled: reference.length > 0,
  });

  const currentStep = data
    ? STEPS.findIndex(
        (step) => step.status === data.status,
      )
    : -1;

  const isCancelled =
    data?.status === "annulee" ||
    data?.status === "remboursee";

  return (
    <div className="container-duplika max-w-5xl py-12">

      {/* EN-TÊTE */}

      <div className="text-center">
        <p className="eyebrow text-primary">
          DUPLIKA
        </p>

        <h1 className="mt-2 text-4xl sm:text-5xl">
          Suivre ma commande
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Entrez votre référence de commande
          pour consulter son état et les
          informations liées à votre achat.
        </p>
      </div>

      {/* RECHERCHE */}

      <form
        className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();

          setReference(
            input.trim().toUpperCase(),
          );
        }}
      >
        <div className="flex-1">
          <Label htmlFor="ref">
            Référence de commande
          </Label>

          <Input
            id="ref"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Ex. DPK-260815-ABC234"
            className="mt-1.5"
          />
        </div>

        <Button type="submit">
          <Search className="mr-2 size-4" />
          Rechercher
        </Button>
      </form>

      {/* CHARGEMENT */}

      {reference && isLoading ? (
        <div className="mt-10 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}

      {/* ERREUR */}

      {reference &&
      !isLoading &&
      (isError || !data) ? (
        <Alert
          variant="destructive"
          className="mx-auto mt-10 max-w-2xl"
        >
          <AlertDescription>
            Aucune commande trouvée pour la
            référence « {reference} ». Vérifiez
            la référence puis réessayez.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* COMMANDE */}

      {data ? (
        <div className="mt-10 space-y-6">

          {/* RÉFÉRENCE + STATUT */}

          <section className="border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Référence
                </p>

                <h2 className="mt-1 font-display text-2xl sm:text-3xl">
                  {data.reference}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Commande passée le{" "}
                  {new Date(
                    data.createdAt,
                  ).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>

              <div
                className={
                  isCancelled
                    ? "self-start rounded-full bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive"
                    : "self-start rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                }
              >
                {STATUS_LABELS[data.status] ??
                  data.status}
              </div>
            </div>
          </section>

          {/* PROGRESSION */}

          {!isCancelled ? (
            <section className="border border-border bg-card p-6 sm:p-8">
              <h3 className="font-display text-2xl">
                Suivi de la commande
              </h3>

              <div className="mt-8 grid grid-cols-5">
                {STEPS.map(
                  (step, index) => {
                    const Icon = step.icon;

                    const done =
                      currentStep >= index &&
                      currentStep >= 0;

                    const active =
                      currentStep === index;

                    return (
                      <div
                        key={step.status}
                        className="relative flex flex-col items-center text-center"
                      >
                        {/* LIGNE */}

                        {index !== 0 ? (
                          <div
                            className={`absolute right-1/2 top-5 h-0.5 w-full ${
                              done
                                ? "bg-primary"
                                : "bg-border"
                            }`}
                          />
                        ) : null}

                        {/* ICÔNE */}

                        <div
                          className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 ${
                            done
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>

                        <p
                          className={`mt-3 hidden text-xs sm:block ${
                            active
                              ? "font-semibold text-primary"
                              : done
                                ? "font-medium"
                                : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>

              {currentStep >= 0 ? (
                <div className="mt-6 flex items-center gap-2 rounded-md bg-secondary p-4 text-sm">
                  <Clock3 className="size-4 shrink-0 text-primary" />

                  <span>
                    Statut actuel :{" "}
                    <strong>
                      {STATUS_LABELS[
                        data.status
                      ] ?? data.status}
                    </strong>
                  </span>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* INFORMATIONS */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* CLIENT */}

            <section className="border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center bg-secondary">
                  <User className="size-5 text-primary" />
                </div>

                <h3 className="font-display text-xl">
                  Informations client
                </h3>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <p className="font-medium">
                  {data.customer.firstName}{" "}
                  {data.customer.lastName}
                </p>

                <p className="text-muted-foreground">
                  {data.customer.email}
                </p>

                {data.customer.phone ? (
                  <p className="text-muted-foreground">
                    {data.customer.phone}
                  </p>
                ) : null}
              </div>
            </section>

            {/* RÉCEPTION */}

            <section className="border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center bg-secondary">
                  {data.address.zoneName
                    ?.toLowerCase()
                    .includes("retrait") ? (
                    <Store className="size-5 text-primary" />
                  ) : (
                    <Truck className="size-5 text-primary" />
                  )}
                </div>

                <h3 className="font-display text-xl">
                  Mode de réception
                </h3>
              </div>

              <div className="mt-5 text-sm">
                <p className="font-medium">
                  {data.address.zoneName ??
                    "Non renseigné"}
                </p>

                {data.address.zoneName
                  ?.toLowerCase()
                  .includes("retrait") ? (
                  <div className="mt-3 flex gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" />

                    <p>
                      Boutique DUPLIKA
                      <br />
                      Agoè Cacavéli,
                      Marché Dekawowo Simé
                      <br />
                      Lomé, Togo
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-muted-foreground">
                    Les modalités et le tarif
                    de livraison sont convenus
                    directement avec l'équipe
                    DUPLIKA.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* PRODUITS */}

          <section className="border border-border bg-card p-6 sm:p-8">
            <h3 className="font-display text-2xl">
              Articles commandés
            </h3>

            <ul className="mt-5 divide-y divide-border border-y border-border">
              {data.quote.lines.map(
                (line) => (
                  <li
                    key={`${line.productSlug}-${line.variantId}`}
                    className="flex items-center justify-between gap-5 py-5"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {line.name}
                      </p>

                      {line.variantLabel ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {line.variantLabel}
                        </p>
                      ) : null}

                      <p className="mt-1 text-sm text-muted-foreground">
                        Quantité :{" "}
                        {line.quantity}
                      </p>
                    </div>

                    <span className="shrink-0 font-medium">
                      {formatPrice(
                        line.lineTotal,
                      )}
                    </span>
                  </li>
                ),
              )}
            </ul>

            {/* TOTAL */}

            <div className="ml-auto mt-6 max-w-sm space-y-3 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-muted-foreground">
                  Sous-total
                </span>

                <span>
                  {formatPrice(
                    data.quote.subtotal,
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-muted-foreground">
                  Livraison
                </span>

                <span className="text-right">
                  {data.address.zoneName
                    ?.toLowerCase()
                    .includes("retrait")
                    ? "Gratuit"
                    : "À convenir"}
                </span>
              </div>

              <div className="flex justify-between gap-6 border-t border-border pt-4 text-lg font-semibold">
                <span>Total produits</span>

                <span className="text-primary">
                  {formatPrice(
                    data.quote.total,
                  )}
                </span>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
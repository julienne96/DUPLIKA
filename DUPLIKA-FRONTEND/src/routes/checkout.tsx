import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  MapPin,
  MessageCircle,
  Store,
  Truck,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import {
  quoteCart,
  submitCheckout,
  syncCinetPayPayment,
  type CheckoutResult,
} from "@/lib/api";
import {
  loadCinetPaySdk,
  openCinetPayPopup,
} from "@/lib/cinetpay";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      {
        title: "Commande | DUPLIKA",
      },
      {
        name: "description",
        content: "Finalisez votre commande DUPLIKA.",
      },
    ],
  }),

  component: CheckoutPage,
});

type DeliveryMode = "pickup" | "delivery";

type PaymentMethod = "cinetpay";

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();

  const [deliveryMode, setDeliveryMode] =
    useState<DeliveryMode>("pickup");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cinetpay");

  const [pendingCheckout, setPendingCheckout] =
    useState<CheckoutResult | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const { data: quote } = useQuery({
    queryKey: [
      "cart-quote",
      cart.lines,
    ],

    queryFn: () =>
      quoteCart(cart.lines),

    enabled:
      cart.hydrated &&
      cart.lines.length > 0,
  });

  useEffect(() => {
    void loadCinetPaySdk().catch(() => {
      // Une erreur explicite sera affichée au clic si le CDN reste indisponible.
    });
  }, []);

  if (
    cart.hydrated &&
    cart.lines.length === 0
  ) {
    return (
      <div className="container-duplika py-20 text-center">
        <h1 className="text-4xl">
          Votre panier est vide
        </h1>

        <Button
          asChild
          className="mt-6"
        >
          <Link to="/boutique">
            Retour à la boutique
          </Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    const form =
      new FormData(
        event.currentTarget,
      );

    setSubmitting(true);

    try {
      const result =
        pendingCheckout ??
        (await submitCheckout({
          customer: {
            firstName: String(
              form.get("firstName") ?? "",
            ),

            lastName: String(
              form.get("lastName") ?? "",
            ),

            email: String(
              form.get("email") ?? "",
            ),

            phone: String(
              form.get("phone") ?? "",
            ),
          },

          address: {
            line1:
              deliveryMode ===
              "delivery"
                ? String(
                    form.get(
                      "addressLine1",
                    ) ?? "",
                  )
                : "Retrait boutique DUPLIKA",

            line2:
              deliveryMode ===
              "delivery"
                ? String(
                    form.get(
                      "addressLine2",
                    ) ?? "",
                  )
                : "",

            city:
              deliveryMode ===
              "delivery"
                ? String(
                    form.get("city") ??
                      "Lomé",
                  )
                : "Lomé",

            zoneId:
              deliveryMode,

            notes: String(
              form.get("notes") ?? "",
            ),
          },

          shippingMethodId:
            deliveryMode,

          paymentMethod,

          lines: cart.lines,

          // Le checkout est désormais réservé
          // aux clients authentifiés.
          createAccount: false,
        }));

      setPendingCheckout(result);

      const popupResult =
        await openCinetPayPopup(result.cinetpay);

      const popupStatus =
        popupResult.status?.toUpperCase();

      if (
        popupStatus === "ACCEPTED" ||
        popupStatus === "REFUSED"
      ) {
        const synchronized =
          await syncCinetPayPayment(
            result.reference,
          );

        if (
          popupStatus === "ACCEPTED" &&
          synchronized.status === "payee"
        ) {
          cart.clear();
          setPendingCheckout(null);

          navigate({
            to: "/suivi",
            search: {
              ref: result.reference,
            },
          });

          toast.success(
            `Paiement confirmé pour la commande ${result.reference}.`,
          );

          return;
        }

        if (popupStatus === "REFUSED") {
          setPendingCheckout(null);
          setError(
            "Le paiement a été refusé. Vous pouvez réessayer avec une nouvelle transaction.",
          );
          return;
        }
      }

      setError(
        `Le paiement de la commande ${result.reference} n'est pas encore confirmé. Cliquez de nouveau pour rouvrir le guichet.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "La commande n'a pas pu être validée.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-duplika py-10">
      {/* EN-TÊTE */}

      <div className="max-w-2xl">
        <p className="eyebrow text-primary">
          Finalisation
        </p>

        <h1 className="mt-2 text-4xl sm:text-5xl">
          Finaliser la commande
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Renseignez vos coordonnées,
          choisissez votre mode de
          réception puis votre moyen de
          paiement.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-10">
          {/* ========================= */}
          {/* COORDONNÉES */}
          {/* ========================= */}

          <fieldset className="space-y-5">
            <legend className="font-display text-2xl">
              Vos coordonnées
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="firstName"
                label="Prénom"
                required
              />

              <Field
                name="lastName"
                label="Nom"
                required
              />

              <Field
                name="email"
                label="E-mail"
                type="email"
                required
              />

              <Field
                name="phone"
                label="Téléphone"
                type="tel"
                required
              />
            </div>
          </fieldset>

          {/* ========================= */}
          {/* MODE DE RÉCEPTION */}
          {/* ========================= */}

          <fieldset>
            <legend className="font-display text-2xl">
              Mode de réception
            </legend>

            <p className="mt-1 text-sm text-muted-foreground">
              Choisissez comment vous
              souhaitez récupérer votre
              commande.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* RETRAIT */}

              <button
                type="button"
                onClick={() =>
                  setDeliveryMode(
                    "pickup",
                  )
                }
                className={`relative flex min-h-32 flex-col items-start border p-5 text-left transition-colors ${
                  deliveryMode ===
                  "pickup"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {deliveryMode ===
                "pickup" ? (
                  <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-4" />
                  </span>
                ) : null}

                <Store className="size-6 text-primary" />

                <span className="mt-4 font-semibold">
                  Retrait à la boutique
                </span>

                <span className="mt-1 text-sm text-muted-foreground">
                  Récupérez votre commande
                  directement chez DUPLIKA.
                </span>
              </button>

              {/* LIVRAISON */}

              <button
                type="button"
                onClick={() =>
                  setDeliveryMode(
                    "delivery",
                  )
                }
                className={`relative flex min-h-32 flex-col items-start border p-5 text-left transition-colors ${
                  deliveryMode ===
                  "delivery"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {deliveryMode ===
                "delivery" ? (
                  <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-4" />
                  </span>
                ) : null}

                <Truck className="size-6 text-primary" />

                <span className="mt-4 font-semibold">
                  Livraison à domicile
                </span>

                <span className="mt-1 text-sm text-muted-foreground">
                  Faites livrer votre
                  commande à l'adresse de
                  votre choix.
                </span>
              </button>
            </div>
          </fieldset>

          {/* ========================= */}
          {/* INFORMATIONS DE LIVRAISON */}
          {/* ========================= */}

          {deliveryMode ===
          "pickup" ? (
            <div className="border border-border bg-card p-6">
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center bg-secondary">
                  <MapPin className="size-5 text-primary" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Retrait à la boutique
                    DUPLIKA
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Agoè Cacavéli
                    <br />
                    Marché Dekawowo Simé
                    <br />
                    Lomé, Togo
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      window.open(
                        "https://www.google.com/maps/search/?api=1&query=Marché+Dekawowo+Simé+Agoè+Cacavéli+Lomé+Togo",
                        "_blank",
                      );
                    }}
                  >
                    <MapPin className="mr-2 size-4" />

                    Voir l'itinéraire
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-card p-6">
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center bg-secondary">
                  <Truck className="size-5 text-primary" />
                </div>

                <div className="w-full">
                  <h3 className="font-semibold">
                    Livraison à domicile
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Renseignez l'adresse à
                    laquelle vous souhaitez
                    recevoir votre commande.
                    Les éventuels frais de
                    livraison sont convenus
                    avec l'équipe DUPLIKA.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field
                        name="addressLine1"
                        label="Adresse de livraison"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Field
                        name="addressLine2"
                        label="Complément d'adresse"
                      />
                    </div>

                    <Field
                      name="city"
                      label="Ville"
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5"
                    onClick={() => {
                      window.open(
                        "https://wa.me/22871161679?text=Bonjour%20DUPLIKA%2C%20je%20souhaite%20obtenir%20des%20informations%20concernant%20la%20livraison%20de%20ma%20commande.",
                        "_blank",
                      );
                    }}
                  >
                    <MessageCircle className="mr-2 size-4" />

                    Contacter DUPLIKA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========================= */}
          {/* MOYEN DE PAIEMENT */}
          {/* ========================= */}

          <fieldset>
            <legend className="font-display text-2xl">
              Moyen de paiement
            </legend>

            <p className="mt-1 text-sm text-muted-foreground">
              Le paiement s'ouvre dans une fenêtre sécurisée sans quitter DUPLIKA.
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setPaymentMethod("cinetpay")}
                className="relative min-h-28 w-full border border-primary bg-primary/5 p-5 text-left"
              >
                <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" />
                </span>

                <span className="font-semibold">
                  Paiement sécurisé CinetPay
                </span>

                <span className="mt-2 block text-sm text-muted-foreground">
                  Réglez par T-Money ou Flooz dans le guichet sécurisé.
                </span>
              </button>
            </div>
          </fieldset>

          {/* ========================= */}
          {/* NOTES */}
          {/* ========================= */}

          <div>
            <Label htmlFor="notes">
              Note concernant la commande
            </Label>

            <Input
              id="notes"
              name="notes"
              className="mt-1.5"
              placeholder="Une précision concernant votre commande ?"
            />
          </div>

          {/* ERREUR */}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        {/* ========================= */}
        {/* RÉCAPITULATIF */}
        {/* ========================= */}

        <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl">
            Récapitulatif
          </h2>

          {/* PRODUITS */}

          <ul className="mt-5 space-y-4 text-sm">
            {quote?.lines.map(
              (line) => (
                <li
                  key={`${line.productSlug}-${line.variantId}`}
                  className="flex justify-between gap-4"
                >
                  <span className="min-w-0">
                    <span className="block">
                      {line.name}
                    </span>

                    <span className="mt-1 block text-xs text-muted-foreground">
                      Quantité :{" "}
                      {line.quantity}
                    </span>
                  </span>

                  <span className="shrink-0 font-medium">
                    {formatPrice(
                      line.lineTotal,
                    )}
                  </span>
                </li>
              ),
            )}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            {/* SOUS-TOTAL */}

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Sous-total
              </dt>

              <dd className="font-medium">
                {formatPrice(
                  quote?.subtotal ?? 0,
                )}
              </dd>
            </div>

            {/* MODE DE RÉCEPTION */}

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Mode de réception
              </dt>

              <dd className="text-right">
                {deliveryMode ===
                "pickup"
                  ? "Retrait boutique"
                  : "Livraison à domicile"}
              </dd>
            </div>

            {/* LIVRAISON */}

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Livraison
              </dt>

              <dd className="max-w-44 text-right">
                {deliveryMode ===
                "pickup"
                  ? "Gratuit"
                  : "À convenir avec DUPLIKA"}
              </dd>
            </div>

            {/* MOYEN DE PAIEMENT */}

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Moyen de paiement
              </dt>

              <dd className="font-medium">
                CinetPay
              </dd>
            </div>

            {/* TOTAL */}

            <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold">
              <dt>
                Total produits
              </dt>

              <dd>
                {formatPrice(
                  quote?.subtotal ?? 0,
                )}
              </dd>
            </div>
          </dl>

          {/* VALIDATION */}

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting}
          >
            {submitting
              ? "Ouverture du paiement…"
              : pendingCheckout
                ? "Reprendre le paiement"
                : "Payer avec CinetPay"}
          </Button>

          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
            Les éventuels frais de
            livraison sont convenus
            séparément avec l'équipe
            DUPLIKA.
          </p>
        </aside>
      </form>
    </div>
  );
}

/*
 * Champ de formulaire réutilisable.
 */
function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </Label>

      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1.5"
      />
    </div>
  );
}

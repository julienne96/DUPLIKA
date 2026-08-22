import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchMyOrders,
  
  updateProfile,
} from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { OrderDetailDialog } from "@/components/shop/OrderDetailDialog";

export const Route = createFileRoute("/compte")({
  head: () => ({
    meta: [
      { title: "Mon compte | DUPLIKA" },
      {
        name: "description",
        content: "Gérez votre profil, vos adresses de livraison et l'historique de vos commandes DUPLIKA.",
      },
      { property: "og:title", content: "Mon compte | DUPLIKA" },
      { property: "og:description", content: "Profil, adresses et historique de commandes DUPLIKA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComptePage,
});

const STATUS_LABELS: Record<string, string> = {
  en_attente_paiement: "En attente de paiement",
  payee: "Payée",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
  remboursee: "Remboursée",
};

function ComptePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/connexion", replace: true });
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user) {
    return (
      <div className="container-duplika max-w-3xl py-14">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container-duplika max-w-3xl py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-4xl sm:text-5xl">Mon compte</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bonjour {user.firstName}, ravie de vous revoir.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await queryClient.cancelQueries();
            await logout();
            toast.success("Vous êtes déconnectée.");
            navigate({ to: "/", replace: true });
          }}
        >
          Se déconnecter
        </Button>
      </div>

      <Tabs defaultValue="commandes" className="mt-8">
        <TabsList>
          <TabsTrigger value="commandes">Commandes</TabsTrigger>
          <TabsTrigger value="adresses">Adresses</TabsTrigger>
          <TabsTrigger value="profil">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="commandes" className="mt-6">
          <OrdersPanel />
        </TabsContent>
        <TabsContent value="adresses" className="mt-6">
          <AddressesPanel />
        </TabsContent>
        <TabsContent value="profil" className="mt-6">
          <ProfilePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrdersPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Impossible de charger votre historique de commandes pour le moment.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? "Chargement…" : "Réessayer"}
        </Button>
      </div>
    );
  }

  const orders = [...(data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Vous n'avez pas encore de commande.</p>
        <Button asChild className="mt-4">
          <Link to="/boutique">Découvrir la boutique</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.reference} className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl">Commande {order.reference}</h2>
              <span className="eyebrow rounded-full bg-secondary px-3 py-1">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR")} ·{" "}
              {order.quote.lines.length} article{order.quote.lines.length > 1 ? "s" : ""}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium">{formatPrice(order.quote.total)}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setSelected(order.reference)}>
                  Voir le détail
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/suivi" search={{ ref: order.reference }}>
                    Suivre cette commande
                  </Link>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <OrderDetailDialog
        reference={selected}
        email={user?.email}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}


const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { message: "Libellé requis." })
    .max(80),

  line1: z
    .string()
    .trim()
    .min(1, { message: "Adresse requise." })
    .max(160),

  line2: z
    .string()
    .trim()
    .max(160)
    .optional(),

  city: z
    .string()
    .trim()
    .min(1, { message: "Ville requise." })
    .max(80),

  phone: z
    .string()
    .trim()
    .min(8, { message: "Numéro de téléphone invalide." })
    .max(32),

  notes: z
    .string()
    .trim()
    .max(300)
    .optional(),
});

function AddressesPanel() {
  const queryClient = useQueryClient();

  const {
    data: addresses,
    isLoading,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  const [error, setError] =
    useState<string | null>(null);

  const [form, setForm] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    phone: "",
    notes: "",
  });

  const create = useMutation({
    mutationFn: createAddress,

    onSuccess: async () => {
      setForm({
        label: "",
        line1: "",
        line2: "",
        city: "",
        phone: "",
        notes: "",
      });

      toast.success("Adresse enregistrée.");

      await queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });
    },
  });

  const remove = useMutation({
    mutationFn: deleteAddress,

    onSuccess: async () => {
      toast.success("Adresse supprimée.");

      await queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">
          Mes adresses
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Enregistrez une adresse pour faciliter vos prochaines commandes.
          Les frais de livraison sont convenus séparément avec l'équipe DUPLIKA.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : null}

      {addresses && addresses.length > 0 ? (
        <ul className="space-y-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-5"
            >
              <div className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {address.label}
                  </p>

                  {address.isDefault ? (
                    <span className="eyebrow rounded-full bg-secondary px-2 py-0.5">
                      Adresse par défaut
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 font-medium">
                  {address.line1}
                </p>

                {address.line2 ? (
                  <p className="text-muted-foreground">
                    {address.line2}
                  </p>
                ) : null}

                <p className="text-muted-foreground">
                  {address.city}
                </p>

                <p className="mt-1 text-muted-foreground">
                  Tél. {address.phone}
                </p>

                {address.notes ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {address.notes}
                  </p>
                ) : null}
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(address.id)
                }
              >
                Supprimer
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous n'avez encore enregistré aucune adresse.
            </p>
          </div>
        )
      )}

      <form
        className="space-y-4 rounded-lg border border-border bg-card p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);

          const parsed =
            addressSchema.safeParse(form);

          if (!parsed.success) {
            setError(
              parsed.error.issues[0]?.message ??
                "Formulaire invalide.",
            );

            return;
          }

          create.mutate({
            ...parsed.data,

            // La première adresse devient
            // automatiquement l'adresse par défaut.
            isDefault:
              (addresses ?? []).length === 0,
          });
        }}
        noValidate
      >
        <h3 className="font-display text-xl">
          Ajouter une adresse
        </h3>

        <div>
          <Label htmlFor="address-label">
            Libellé
          </Label>

          <Input
            id="address-label"
            value={form.label}
            placeholder="Ex. Maison, Bureau"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                label: event.target.value,
              }))
            }
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="line1">
            Adresse
          </Label>

          <Input
            id="line1"
            value={form.line1}
            placeholder="Ex. Agoè Cacavéli"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                line1: event.target.value,
              }))
            }
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="line2">
            Complément d'adresse (optionnel)
          </Label>

          <Input
            id="line2"
            value={form.line2}
            placeholder="Quartier, rue, repère..."
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                line2: event.target.value,
              }))
            }
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">
              Ville
            </Label>

            <Input
              id="city"
              value={form.city}
              placeholder="Lomé"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="address-phone">
              Téléphone
            </Label>

            <Input
              id="address-phone"
              type="tel"
              value={form.phone}
              placeholder="Ex. 90 XX XX XX"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">
            Indications complémentaires (optionnel)
          </Label>

          <Input
            id="notes"
            value={form.notes}
            placeholder="Ex. Maison près de..."
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            className="mt-1.5"
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          disabled={create.isPending}
        >
          {create.isPending
            ? "Enregistrement…"
            : "Enregistrer l'adresse"}
        </Button>
      </form>
    </div>
  );
}

const profileSchema = z.object({
  firstName: z.string().trim().min(1, { message: "Prénom requis." }).max(80),
  lastName: z.string().trim().min(1, { message: "Nom requis." }).max(80),
  email: z.string().trim().email({ message: "Adresse e-mail invalide." }).max(255),
  phone: z.string().trim().min(8, { message: "Numéro invalide." }).max(32),
});

function ProfilePanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  const save = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      toast.success("Profil mis à jour.");
    },
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const parsed = profileSchema.safeParse(form);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
          return;
        }
        save.mutate(parsed.data);
      }}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="p-firstName">Prénom</Label>
          <Input id="p-firstName" value={form.firstName} onChange={set("firstName")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="p-lastName">Nom</Label>
          <Input id="p-lastName" value={form.lastName} onChange={set("lastName")} className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label htmlFor="p-email">Adresse e-mail</Label>
        <Input id="p-email" type="email" value={form.email} onChange={set("email")} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="p-phone">Téléphone</Label>
        <Input id="p-phone" type="tel" value={form.phone} onChange={set("phone")} className="mt-1.5" />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}

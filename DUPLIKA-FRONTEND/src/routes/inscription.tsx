import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "Créer mon compte | DUPLIKA" },
      {
        name: "description",
        content:
          "Créez votre compte DUPLIKA : commandes plus rapides, adresses enregistrées et suivi de livraison en un clic.",
      },
      { property: "og:title", content: "Créer mon compte | DUPLIKA" },
      { property: "og:description", content: "Commandes plus rapides et suivi de livraison DUPLIKA." },
    ],
  }),
  component: InscriptionPage,
});

const schema = z.object({
  firstName: z.string().trim().min(1, { message: "Prénom requis." }).max(80),
  lastName: z.string().trim().min(1, { message: "Nom requis." }).max(80),
  email: z.string().trim().email({ message: "Adresse e-mail invalide." }).max(255),
  phone: z.string().trim().min(8, { message: "Numéro de téléphone invalide." }).max(32),
  password: z.string().min(8, { message: "8 caractères minimum." }).max(72),
});

function InscriptionPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
      return;
    }
    setPending(true);
    try {
      await register(parsed.data);
      toast.success("Compte créé, bienvenue chez DUPLIKA.");
      navigate({ to: "/compte" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container-duplika max-w-md py-14">
      <h1 className="text-4xl sm:text-5xl">Créer un compte</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vos commandes, vos adresses et votre suivi au même endroit.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" value={form.firstName} onChange={set("firstName")} className="mt-1.5" autoComplete="given-name" required />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" value={form.lastName} onChange={set("lastName")} className="mt-1.5" autoComplete="family-name" required />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" type="email" value={form.email} onChange={set("email")} className="mt-1.5" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} className="mt-1.5" autoComplete="tel" required />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" value={form.password} onChange={set("password")} className="mt-1.5" autoComplete="new-password" required />
          <p className="mt-1 text-xs text-muted-foreground">8 caractères minimum.</p>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Déjà cliente ?{" "}
        <Link to="/connexion" className="text-primary underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

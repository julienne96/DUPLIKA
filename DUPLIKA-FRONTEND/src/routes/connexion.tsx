import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { requestPasswordReset, USING_DEMO_DATA } from "@/lib/api";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion à mon compte | DUPLIKA" },
      {
        name: "description",
        content:
          "Connectez-vous à votre compte DUPLIKA pour suivre vos commandes, gérer vos adresses et retrouver vos coordonnées.",
      },
      { property: "og:title", content: "Connexion à mon compte | DUPLIKA" },
      { property: "og:description", content: "Accédez à vos commandes et à vos adresses DUPLIKA." },
    ],
  }),
  component: ConnexionPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Adresse e-mail invalide." }).max(255),
  password: z.string().min(8, { message: "8 caractères minimum." }).max(72),
});

function ConnexionPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
      return;
    }
    setPending(true);
    try {
      await login(parsed.data);
      toast.success("Bienvenue !");
      navigate({ to: "/compte" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container-duplika max-w-md py-14">
      <h1 className="text-4xl sm:text-5xl">Connexion</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Retrouvez vos commandes, vos adresses et vos préférences.
      </p>

      {USING_DEMO_DATA ? (
        <Alert className="mt-6">
          <AlertDescription>
            Mode démonstration : créez un compte, il sera conservé sur cet appareil en attendant
            l'API.
          </AlertDescription>
        </Alert>
      ) : null}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-sm">
        <button
          type="button"
          className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          onClick={async () => {
            const parsed = z.string().email().safeParse(email.trim());
            if (!parsed.success) {
              setError("Saisissez votre e-mail pour recevoir un lien de réinitialisation.");
              return;
            }
            await requestPasswordReset(parsed.data);
            toast.success("Si un compte existe, un e-mail vient d'être envoyé.");
          }}
        >
          Mot de passe oublié ?
        </button>
        <p className="text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-primary underline-offset-4 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

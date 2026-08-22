import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { subscribeNewsletter } from "@/lib/api";

export function SiteFooter() {
  const [newsletterLoading, setNewsletterLoading] =
  useState(false);
  return (
    <footer className="mt-24 border-t border-border bg-secondary">
      <div className="container-duplika grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="font-display text-2xl tracking-[0.28em]">DUPLIKA</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Perruques et accessoires capillaires sélectionnés pièce par pièce, pensés pour tenir
            dans la durée.
          </p>
          <div className="flex gap-2 pt-1">
            <a href="https://instagram.com" aria-label="Instagram" className="rounded-md p-2 hover:bg-accent">
              <Instagram className="size-4" />
            </a>
            <a href="https://facebook.com" aria-label="Facebook" className="rounded-md p-2 hover:bg-accent">
              <Facebook className="size-4" />
            </a>
            <a href="https://tiktok.com" aria-label="TikTok" className="rounded-md p-2 hover:bg-accent">
              <Music2 className="size-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Boutique" className="space-y-2 text-sm">
          <p className="eyebrow text-muted-foreground">Boutique</p>
          <Link to="/boutique" className="block hover:text-primary">
            Tous les produits
          </Link>
          <Link to="/boutique" search={{ categorie: "perruques-lace" }} className="block hover:text-primary">
            Perruques lace
          </Link>
          <Link to="/boutique" search={{ categorie: "tissages" }} className="block hover:text-primary">
            Tissages & mèches
          </Link>
          <Link to="/boutique" search={{ categorie: "accessoires" }} className="block hover:text-primary">
            Accessoires
          </Link>
        </nav>

        <nav aria-label="Aide" className="space-y-2 text-sm">
          <p className="eyebrow text-muted-foreground">Aide</p>
          <Link to="/suivi" className="block hover:text-primary">
            Suivre ma commande
          </Link>
          <Link to="/pages/$slug" params={{ slug: "livraison-retours" }} className="block hover:text-primary">
            Livraison & retours
          </Link>
          <Link to="/pages/$slug" params={{ slug: "faq" }} className="block hover:text-primary">
            FAQ
          </Link>
          <Link to="/pages/$slug" params={{ slug: "contact" }} className="block hover:text-primary">
            Contact
          </Link>
        </nav>

        <div className="space-y-3">
          <p className="eyebrow text-muted-foreground">Newsletter</p>
          <p className="text-sm text-muted-foreground">
            Nouveautés, réassorts et conseils d'entretien. Un e-mail par mois, pas plus.
          </p>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const email = String(
    new FormData(form).get("email") ?? "",
  ).trim();

  if (!email) {
    toast.error("Veuillez saisir votre adresse e-mail.");
    return;
  }

  setNewsletterLoading(true);

  try {
    const response =
      await subscribeNewsletter(email);

    toast.success(response.message);

    form.reset();
  } catch (error) {
    toast.error(
      "Impossible de vous inscrire à la newsletter pour le moment.",
    );
  } finally {
    setNewsletterLoading(false);
  }
}}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Adresse e-mail
            </label>
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
              className="bg-background"
            />
           <Button
  type="submit"
  disabled={newsletterLoading}
>
  {newsletterLoading ? "..." : "OK"}
</Button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-duplika flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DUPLIKA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/pages/$slug" params={{ slug: "cgv" }} className="hover:text-primary">
              CGV
            </Link>
            <Link to="/pages/$slug" params={{ slug: "confidentialite" }} className="hover:text-primary">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

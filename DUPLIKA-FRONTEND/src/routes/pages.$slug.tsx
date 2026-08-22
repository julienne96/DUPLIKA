import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { sendContactMessage } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

/** Pages institutionnelles — administrables depuis le back-office (module CMS). */
const PAGES: Record<string, { title: string; description: string; blocks: { heading?: string; text: string }[] }> = {
  "notre-histoire": {
    title: "Notre histoire",
    description: "La démarche DUPLIKA : sélection limitée, contrôle des pièces et accompagnement après achat.",
    blocks: [
      { text: "DUPLIKA est née d'une frustration partagée : acheter une pièce capillaire sans savoir d'où elle vient, comment l'entretenir, ni à qui s'adresser en cas de problème." },
      { heading: "Une sélection volontairement courte", text: "Nous préférons quelques références maîtrisées à un catalogue interminable. Chaque pièce est testée en interne avant d'être mise en vente." },
      { heading: "L'entretien fait partie du produit", text: "Chaque commande est accompagnée d'un protocole d'entretien clair. Une pièce bien entretenue dure deux fois plus longtemps." },
    ],
  },
  "livraison-retours": {
    title: "Livraison & retours",
    description: "Délais de préparation, zones de livraison et conditions de retour DUPLIKA.",
    blocks: [
      { heading: "Préparation", text: "Les commandes sont préparées sous 24 à 48 h ouvrées après confirmation du paiement." },
      { heading: "Zones et délais", text: "Abidjan : 24 à 48 h. Intérieur du pays : 2 à 4 jours via transporteur partenaire. International : 5 à 9 jours en express. Livraison offerte à partir de 150 000 XOF." },
      { heading: "Retours", text: "Vous disposez de 7 jours après réception pour demander un retour, à condition que la pièce n'ait été ni portée, ni découpée, ni colorée, et que son emballage d'origine soit intact." },
    ],
  },
  faq: {
    title: "Questions fréquentes",
    description: "Tailles de bonnet, entretien, durée de vie et paiement : les réponses aux questions les plus posées.",
    blocks: [
      { heading: "Comment choisir ma taille de bonnet ?", text: "Mesurez votre tour de tête au ras du front. Moins de 54 cm : Small. 54 à 57 cm : Medium. Plus de 57 cm : Large." },
      { heading: "Combien de temps dure une pièce ?", text: "Entre 8 et 18 mois selon la fréquence de port et la régularité de l'entretien." },
      { heading: "Quels moyens de paiement acceptez-vous ?", text: "Mobile money et cartes bancaires via notre prestataire de paiement sécurisé. Aucune donnée bancaire n'est conservée par DUPLIKA." },
    ],
  },
  contact: {
    title: "Nous contacter",
    description: "Une question avant ou après votre achat ? L'équipe DUPLIKA vous répond.",
    blocks: [
      { text: "Écrivez-nous à bonjour@duplika.example ou via nos réseaux sociaux. Nous répondons du lundi au samedi, de 9 h à 18 h." },
      { heading: "Commande en cours", text: "Munissez-vous de votre référence de commande (format DPK-XXXXXX) pour un traitement plus rapide." },
    ],
  },
  cgv: {
    title: "Conditions générales de vente",
    description: "Conditions applicables aux commandes passées sur la boutique DUPLIKA.",
    blocks: [
      { text: "Les présentes conditions régissent les ventes conclues sur la boutique DUPLIKA. Toute commande vaut acceptation sans réserve." },
      { heading: "Prix", text: "Les prix sont indiqués toutes taxes comprises, hors frais de livraison précisés avant validation de la commande." },
      { heading: "Paiement", text: "La commande est confirmée après validation du paiement par notre prestataire. Un retour de navigateur seul ne vaut pas confirmation." },
    ],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    description: "Données collectées, finalités et droits des utilisateurs sur la boutique DUPLIKA.",
    blocks: [
      { text: "Nous collectons uniquement les données nécessaires au traitement de vos commandes : identité, coordonnées, adresse de livraison et historique d'achat." },
      { heading: "Vos droits", text: "Vous pouvez demander l'accès, la rectification ou la suppression de vos données à tout moment en nous écrivant." },
    ],
  },
};

export const Route = createFileRoute("/pages/$slug")({
  loader: ({ params }) => {
    const page = PAGES[params.slug];
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }: { loaderData?: { title: string; description: string } | undefined }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | DUPLIKA` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.title} | DUPLIKA` },
          { property: "og:description", content: loaderData.description },
        ]
      : [],
  }),
  component: CmsPage,
});

function CmsPage() {
  const page = Route.useLoaderData() as (typeof PAGES)[string];
  const [sending, setSending] = useState(false);

  return (
    <article className="container-duplika max-w-3xl py-14">
      <h1 className="text-4xl sm:text-5xl">{page.title}</h1>
      <div className="mt-8 space-y-7">
        {page.blocks.map((block, i) => (
          <section key={i}>
            {block.heading ? <h2 className="text-2xl">{block.heading}</h2> : null}
            <p className="mt-2 text-muted-foreground">{block.text}</p>

            {page.title === "Nous contacter" ? (
  <form
    className="mt-10 space-y-5 rounded-lg border border-border bg-card p-6"
    onSubmit={async (event) => {
      event.preventDefault();

      const form = new FormData(event.currentTarget);

      setSending(true);

      try {
        await sendContactMessage({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          subject: String(form.get("subject") ?? ""),
          message: String(form.get("message") ?? ""),
        });

        event.currentTarget.reset();

        toast.success(
          "Votre message a bien été envoyé.",
        );
      } catch {
        toast.error(
          "Impossible d'envoyer votre message pour le moment.",
        );
      } finally {
        setSending(false);
      }
    }}
  >
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="contact-name">
          Nom
        </Label>
        <Input
          id="contact-name"
          name="name"
          required
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="contact-email">
          E-mail
        </Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          className="mt-1.5"
        />
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="contact-phone">
          Téléphone
        </Label>
        <Input
          id="contact-phone"
          name="phone"
          type="tel"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="contact-subject">
          Sujet
        </Label>
        <Input
          id="contact-subject"
          name="subject"
          className="mt-1.5"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="contact-message">
        Message
      </Label>
      <Textarea
        id="contact-message"
        name="message"
        required
        rows={6}
        className="mt-1.5"
      />
    </div>

    <Button
      type="submit"
      disabled={sending}
    >
      {sending
        ? "Envoi en cours…"
        : "Envoyer le message"}
    </Button>
  </form>
) : null}
          </section>
        ))}
      </div>
    </article>
  );
}

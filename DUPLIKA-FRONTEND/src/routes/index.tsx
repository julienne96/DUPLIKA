import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, ShieldCheck, Sparkles, Headphones, Star, Check } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { fetchCollections, fetchProducts } from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/ProductCard";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DUPLIKA — Perruques lace & accessoires capillaires premium" },
      {
        name: "description",
        content:
          "Découvrez les perruques lace, tissages et soins DUPLIKA. Pièces montées à la main, livraison suivie et conseils d'entretien inclus.",
      },
      { property: "og:title", content: "DUPLIKA — Perruques & accessoires capillaires premium" },
      {
        property: "og:description",
        content:
          "Pièces montées à la main, lace HD invisible, livraison suivie et retours simples sous 7 jours.",
      },
    ],
  }),
  component: Home,
});

const arguments_ = [
  { icon: Sparkles, title: "Montage à la main", text: "Implantation nœud par nœud, densité contrôlée pièce par pièce." },
  { icon: Truck, title: "Livraison suivie", text: "Préparation sous 48 h et suivi de commande en temps réel." },
  { icon: ShieldCheck, title: "Retour 7 jours", text: "Pièce non portée, non découpée : retour accepté sans discussion." },
  { icon: Headphones, title: "Conseil personnalisé", text: "Une équipe qui répond avant et après votre achat." },
];

const temoignages = [
  { nom: "Aïcha K.", texte: "La lace se fond parfaitement, personne n'a deviné. Le suivi de commande était impeccable.", note: 5 },
  { nom: "Mariam T.", texte: "Deuxième commande. Les boucles tiennent après plusieurs lavages, c'est rare.", note: 5 },
  { nom: "Fatou D.", texte: "Livraison en 24 h à Abidjan et un vrai conseil sur la taille de bonnet.", note: 4 },
];

function Home() {
  const { data: products, isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: collections } = useQuery({ queryKey: ["collections"], queryFn: fetchCollections });

  const nouveautes = (products ?? []).filter((p) => p.isNew).slice(0, 4);
  const recommandes = (products ?? [])
    .filter((p) => !p.isNew)
    .sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
    .slice(0, 4);

  return (
    <>
      {/* 3. Hero */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="container-duplika grid items-center gap-8 py-14 lg:grid-cols-2 lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow text-primary">Collection Signature</p>
            <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Une chevelure qui vous ressemble, pas une perruque.
            </h1>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Des pièces montées à la main, une lace teintée pour votre carnation et un entretien
              expliqué pas à pas. DUPLIKA conçoit des coiffures faites pour durer.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/boutique">Découvrir la boutique</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pages/$slug" params={{ slug: "notre-histoire" }}>
                  Notre histoire
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Modèle portant une perruque ondulée DUPLIKA sur fond ivoire"
              width={1920}
              height={1280}
              fetchPriority="high"
              className="aspect-[4/3] w-full rounded-lg object-cover shadow-lifted lg:aspect-[5/6]"
            />
          </div>
        </div>
      </section>

      {/* 4. Arguments */}
      <section className="border-y border-border bg-background">
        <div className="container-duplika grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {arguments_.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Nouveautés */}
      <Section
        eyebrow="Arrivages"
        title="Les nouveautés"
        action={<Link to="/boutique" className="text-sm underline underline-offset-4 hover:text-primary">Tout voir</Link>}
      >
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {isLoading
            ? [0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
            : nouveautes.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </Section>

      {/* 6. Navigation par collections */}
      <Section eyebrow="Styles" title="Naviguer par collection">
        <div className="grid gap-5 sm:grid-cols-3">
          {(collections ?? []).map((c) => (
            <Link
              key={c.slug}
              to="/boutique"
              search={{ collection: c.slug }}
              className="group relative overflow-hidden rounded-lg"
            >
              <img
                src={c.image}
                alt={`Collection ${c.name}`}
                width={1024}
                height={1280}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5">
                <p className="font-display text-2xl text-background">{c.name}</p>
                <p className="text-sm text-background/80">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* 7. Éditorial marque */}
      <section className="bg-secondary py-16">
        <div className="container-duplika grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-primary">La maison</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Le soin du détail, avant le volume</h2>
            <p className="mt-5 text-muted-foreground">
              DUPLIKA est née d'un constat simple : trop de pièces sont vendues sans explication,
              sans suivi et sans possibilité de retour. Nous avons choisi l'inverse. Chaque
              référence est testée en interne, photographiée sans retouche du cheveu et
              accompagnée d'un protocole d'entretien clair.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Sélection limitée : moins de références, mieux contrôlées.",
                "Fiches produits complètes : matière, densité, base, entretien.",
                "Accompagnement après achat, pas seulement avant.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 8. Comparaison / avantages différenciants */}
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="eyebrow text-muted-foreground">Ce qui nous différencie</p>
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Comparaison DUPLIKA et boutiques classiques</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-2 font-medium">Critère</th>
                  <th scope="col" className="py-2 font-medium">DUPLIKA</th>
                  <th scope="col" className="py-2 font-medium text-muted-foreground">Ailleurs</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Origine des cheveux", "Documentée", "Rarement précisée"],
                  ["Retour", "7 jours", "Souvent refusé"],
                  ["Entretien", "Protocole fourni", "Aucun"],
                  ["Suivi de commande", "En temps réel", "Par message"],
                ].map(([critere, nous, autres]) => (
                  <tr key={critere} className="border-b border-border/60 last:border-0">
                    <th scope="row" className="py-2.5 text-left font-normal">{critere}</th>
                    <td className="py-2.5 font-medium text-primary">{nous}</td>
                    <td className="py-2.5 text-muted-foreground">{autres}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. Témoignages */}
      <Section eyebrow="Elles nous font confiance" title="Avis vérifiés">
        <div className="grid gap-5 md:grid-cols-3">
          {temoignages.map((t) => (
            <figure key={t.nom} className="rounded-lg border border-border bg-card p-6">
              <div className="flex gap-0.5" aria-label={`${t.note} étoiles sur 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={i < t.note ? "size-4 fill-primary text-primary" : "size-4 text-muted-foreground/40"}
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote className="mt-3 text-sm">« {t.texte} »</blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground">{t.nom}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* 10. Sélection recommandée */}
      <Section eyebrow="Sélection" title="Nos incontournables">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {isLoading
            ? [0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
            : recommandes.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </Section>

      {/* 12. Newsletter */}
      <section className="bg-ink py-16 text-background">
        <div className="container-duplika max-w-2xl text-center">
          <h2 className="text-4xl">Restez informée des réassorts</h2>
          <p className="mt-3 text-sm text-background/70">
            Les pièces les plus demandées partent en quelques jours. Recevez un e-mail dès leur
            retour en stock.
          </p>
          <form
            className="mx-auto mt-6 flex max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              toast.success("Merci, votre inscription est enregistrée.");
              form.reset();
            }}
          >
            <label htmlFor="home-newsletter" className="sr-only">
              Adresse e-mail
            </label>
            <Input
              id="home-newsletter"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
              className="border-background/30 bg-background/10 text-background placeholder:text-background/50"
            />
            <Button type="submit" variant="secondary">
              Je m'inscris
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}

function Section({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="container-duplika py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">{eyebrow}</p>
          <h2 className="mt-2 text-4xl sm:text-5xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

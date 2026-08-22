import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";

import {
  fetchSmartMatch,
  type SmartMatchCriteria,
  type SmartMatchResult,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProductImage } from "@/lib/product-images";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/smartmatch")({
  component: SmartMatchPage,
});

const initialForm: SmartMatchCriteria = {
  wig_type: "",
  texture: "",
  color: "",
  length: "",
  style: "",
  occasion: "",
  budget: 150000,
};


function SmartMatchPage() {
  const [form, setForm] = useState<SmartMatchCriteria>(initialForm);
  const [results, setResults] = useState<SmartMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof SmartMatchCriteria,
    value: string | number,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const data = await fetchSmartMatch(form);

      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error(err);

      setError(
        "SmartMatch n'a pas pu effectuer la recommandation. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm(initialForm);
    setResults([]);
    setSearched(false);
    setError("");
  }

  return (
    <main className="container-duplika py-12 sm:py-16">
      <section className="mx-auto max-w-4xl">

        {/* INTRODUCTION */}

        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>

          <p className="eyebrow text-primary">
            Conseiller personnalisé
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl">
            DUPLIKA SmartMatch
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Dites-nous ce que vous recherchez et SmartMatch sélectionnera
            les perruques disponibles qui correspondent le mieux à vos
            préférences et à votre budget.
          </p>
        </div>

        {/* QUESTIONNAIRE */}

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">

            {/* TYPE */}

            <div className="space-y-2">
              <Label>Type de perruque</Label>

              <Select
                value={form.wig_type}
                onValueChange={(value) =>
                  updateField("wig_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="lace">Lace</SelectItem>
                  <SelectItem value="naturelle">
                    Perruque naturelle
                  </SelectItem>
                  <SelectItem value="tissage">
                    Tissage
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TEXTURE */}

            <div className="space-y-2">
              <Label>Texture</Label>

              <Select
                value={form.texture}
                onValueChange={(value) =>
                  updateField("texture", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une texture" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="lisse">Lisse</SelectItem>
                  <SelectItem value="bouclee">Bouclée</SelectItem>
                  <SelectItem value="ondulee">Ondulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* COULEUR */}

            <div className="space-y-2">
              <Label>Couleur</Label>

              <Select
                value={form.color}
                onValueChange={(value) =>
                  updateField("color", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une couleur" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="noire">Noire</SelectItem>
                  <SelectItem value="brune">Brune</SelectItem>
                  <SelectItem value="blond miel">
                    Blond miel
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* LONGUEUR */}

            <div className="space-y-2">
              <Label>Longueur</Label>

              <Select
                value={form.length}
                onValueChange={(value) =>
                  updateField("length", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une longueur" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="courte">Courte</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="longue">Longue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* STYLE */}

            <div className="space-y-2">
              <Label>Style recherché</Label>

              <Select
                value={form.style}
                onValueChange={(value) =>
                  updateField("style", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un style" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="elegant">Élégant</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="chic">Chic</SelectItem>
                  <SelectItem value="naturel">Naturel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* OCCASION */}

            <div className="space-y-2">
              <Label>Occasion</Label>

              <Select
                value={form.occasion}
                onValueChange={(value) =>
                  updateField("occasion", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une occasion" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="quotidien">
                    Quotidien
                  </SelectItem>

                  <SelectItem value="sortie">
                    Sortie
                  </SelectItem>

                  <SelectItem value="ceremonie">
                    Cérémonie
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BUDGET */}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="budget">
                Budget maximum
              </Label>

              <Input
                id="budget"
                type="number"
                min="0"
                required
                value={form.budget}
                onChange={(event) =>
                  updateField(
                    "budget",
                    Number(event.target.value),
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                Indiquez le montant maximum que vous souhaitez dépenser.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
            >
              <Sparkles className="size-4" />

              {loading
                ? "Analyse en cours..."
                : "Trouver ma perruque"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={reset}
            >
              <RotateCcw className="size-4" />
              Réinitialiser
            </Button>
          </div>
        </form>

        {/* ERREUR */}

        {error ? (
          <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {/* RÉSULTATS */}

        {searched ? (
          <section className="mt-14">
            <div className="mb-7">
              <p className="eyebrow text-primary">
                Vos résultats
              </p>

              <h2 className="mt-2 text-3xl">
                Nos recommandations pour vous
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Les résultats sont classés selon leur correspondance
                avec vos critères.
              </p>
            </div>

            {results.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-14 text-center">
                <p className="font-display text-2xl">
                  Aucun produit correspondant
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  Essayez d'augmenter votre budget ou de modifier
                  certains critères.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                {results.map((product, index) => (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"
                  >
                    <div className="overflow-hidden bg-secondary">
                    <img
                    src={getProductImage(
  product.slug,
  product.image,
)}
                       alt={product.name}
                      className="aspect-[4/5] w-full object-cover"
                    loading="lazy" />
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-primary">
                          Choix {index + 1}
                        </span>

                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {product.smartmatch_score} %
                        </span>
                      </div>

                      <h3 className="font-display text-xl">
                        {product.name}
                      </h3>

                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {product.texture ? (
                          <p>Texture : {product.texture}</p>
                        ) : null}

                        {product.color ? (
                          <p>Couleur : {product.color}</p>
                        ) : null}

                        {product.length ? (
                          <p>Longueur : {product.length}</p>
                        ) : null}

                        <p>Stock disponible : {product.stock}</p>
                      </div>

                      <p className="mt-4 text-lg font-medium">
                        {new Intl.NumberFormat("fr-FR").format(
                          product.price,
                        )}{" "}
                        FCFA
                      </p>

                      <Button
                        asChild
                        className="mt-5 w-full"
                      >
                        <Link
                          to="/produit/$slug"
                          params={{ slug: product.slug }}
                        >
                          Voir le produit
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchCategories, fetchCollections, fetchProducts } from "@/lib/api";
import { ProductCard, ProductCardSkeleton, productPriceRange, totalStock } from "@/components/shop/ProductCard";
import type { Product } from "@/lib/types";

const searchSchema = z.object({
  q: z.string().optional(),
  categorie: z.string().optional(),
  collection: z.string().optional(),
  dispo: z.boolean().optional(),
  promo: z.boolean().optional(),
  tri: z.enum(["nouveaute", "prix-asc", "prix-desc", "populaire"]).optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/boutique")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Boutique — Perruques, tissages et accessoires | DUPLIKA" },
      {
        name: "description",
        content:
          "Filtrez les perruques lace, tissages et accessoires DUPLIKA par catégorie, collection, disponibilité et prix. Livraison suivie.",
      },
      { property: "og:title", content: "Boutique DUPLIKA" },
      {
        property: "og:description",
        content: "Perruques lace, tissages et accessoires capillaires premium.",
      },
    ],
  }),
  component: Boutique,
});

const PER_PAGE = 8;

function Boutique() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/boutique" });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: collections } = useQuery({ queryKey: ["collections"], queryFn: fetchCollections });

  const update = (patch: Partial<z.infer<typeof searchSchema>>) =>
    navigate({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, ...patch, page: patch.page ?? 1 }) });

  const filtered = useMemo(() => {
    let list = [...(products ?? [])];
    const q = search.q?.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.sku, p.categorySlug, p.shortDescription, ...Object.values(p.attributes)]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (search.categorie) list = list.filter((p) => p.categorySlug === search.categorie);
    if (search.collection) list = list.filter((p) => p.collectionSlugs.includes(search.collection!));
    if (search.dispo) list = list.filter((p) => totalStock(p) > 0);
    if (search.promo)
      list = list.filter((p) => p.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price));

    const sorters: Record<string, (a: Product, b: Product) => number> = {
      "prix-asc": (a, b) => productPriceRange(a).min - productPriceRange(b).min,
      "prix-desc": (a, b) => productPriceRange(b).min - productPriceRange(a).min,
      populaire: (a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
      nouveaute: (a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false),
    };
    return list.sort(sorters[search.tri ?? "nouveaute"]!);
  }, [products, search]);

  const page = search.page ?? 1;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const filtersNode = (
    <div className="space-y-7">
      <fieldset>
        <legend className="eyebrow mb-3 text-muted-foreground">Catégories</legend>
        <div className="space-y-2">
          <FilterRadio
            id="cat-all"
            label="Toutes"
            checked={!search.categorie}
            onChange={() => update({ categorie: undefined })}
          />
          {(categories ?? []).map((c) => (
            <FilterRadio
              key={c.slug}
              id={`cat-${c.slug}`}
              label={c.name}
              checked={search.categorie === c.slug}
              onChange={() => update({ categorie: c.slug })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-muted-foreground">Collections</legend>
        <div className="space-y-2">
          <FilterRadio
            id="col-all"
            label="Toutes"
            checked={!search.collection}
            onChange={() => update({ collection: undefined })}
          />
          {(collections ?? []).map((c) => (
            <FilterRadio
              key={c.slug}
              id={`col-${c.slug}`}
              label={c.name}
              checked={search.collection === c.slug}
              onChange={() => update({ collection: c.slug })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-muted-foreground">Disponibilité</legend>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="f-dispo"
              checked={!!search.dispo}
              onCheckedChange={(v) => update({ dispo: v === true ? true : undefined })}
            />
            <Label htmlFor="f-dispo" className="font-normal">En stock uniquement</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="f-promo"
              checked={!!search.promo}
              onCheckedChange={(v) => update({ promo: v === true ? true : undefined })}
            />
            <Label htmlFor="f-promo" className="font-normal">En promotion</Label>
          </div>
        </div>
      </fieldset>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() =>
          navigate({ search: {} })
        }
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );

  return (
    <div className="container-duplika py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Boutique</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl">
          {search.q ? `Résultats pour « ${search.q} »` : "La boutique"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length} produit{filtered.length > 1 ? "s" : ""}
        </p>
      </header>

      <div className="flex items-center justify-between gap-3 border-y border-border py-3 lg:justify-end">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="size-4" /> Filtrer
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetTitle className="font-display text-2xl">Filtres</SheetTitle>
            <div className="mt-6 pb-6">{filtersNode}</div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Label htmlFor="tri" className="text-sm text-muted-foreground">Trier</Label>
          <Select
            value={search.tri ?? "nouveaute"}
            onValueChange={(v) => update({ tri: v as never })}
          >
            <SelectTrigger id="tri" className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nouveaute">Nouveautés</SelectItem>
              <SelectItem value="populaire">Popularité</SelectItem>
              <SelectItem value="prix-asc">Prix croissant</SelectItem>
              <SelectItem value="prix-desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filtersNode}</aside>

        <div>
          {isError ? (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between gap-4">
                Le catalogue est momentanément indisponible.
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
              <p className="font-display text-2xl">Aucun produit ne correspond</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Essayez d'élargir vos filtres ou de modifier votre recherche.
              </p>
              <Button variant="outline" className="mt-5" onClick={() => navigate({ search: {} })}>
                Réinitialiser
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
                {paginated.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>

              {pageCount > 1 ? (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={page === i + 1 ? "default" : "outline"}
                      aria-current={page === i + 1 ? "page" : undefined}
                      onClick={() => navigate({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, page: i + 1 }) })}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterRadio({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        id={id}
        checked={checked}
        onChange={onChange}
        className="size-3.5 accent-[var(--color-primary)]"
      />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  );
}

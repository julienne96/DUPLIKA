import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { fetchCategories, fetchCollections, fetchProducts } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { productPriceRange } from "@/components/shop/ProductCard";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function PromoBar() {
  // Contenu administrable depuis le back-office (bloc « barre promotionnelle »).
  return (
    <div className="bg-ink text-background">
      <div className="container-duplika flex h-9 items-center justify-center">
        <p className="eyebrow text-center">
          Bienvenue chez DUPLIKA. Pour une recommandation personnalisée cliquer sur SmartMatch.
        </p>
      </div>
    </div>
  );
}

function SearchPanel({ onNavigate }: { onNavigate: () => void }) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const suggestions = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (q.length < 2) return [];
    return (products ?? [])
      .filter((p) =>
        [p.name, p.sku, p.categorySlug, p.shortDescription, ...Object.values(p.attributes)]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 6);
  }, [term, products]);

  return (
    <div className="space-y-4">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (!term.trim()) return;
          navigate({ to: "/boutique", search: { q: term.trim() } });
          onNavigate();
        }}
        className="flex items-center gap-2 border-b border-border pb-3"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor="site-search" className="sr-only">
          Rechercher un produit
        </label>
        <input
          id="site-search"
          ref={inputRef}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Rechercher une perruque, une référence, un accessoire…"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </form>

      {term.trim().length >= 2 && suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun produit ne correspond à « {term} ».</p>
      ) : null}

      <ul className="space-y-1">
        {suggestions.map((product) => (
          <li key={product.slug}>
            <Link
              to="/produit/$slug"
              params={{ slug: product.slug }}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-secondary"
            >
              <img
                src={product.media[0]?.url}
                alt=""
                width={64}
                height={80}
                loading="lazy"
                className="size-12 rounded object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{product.name}</span>
                <span className="block text-xs text-muted-foreground">{product.sku}</span>
              </span>
              <span className="text-sm">{formatPrice(productPriceRange(product).min)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteHeader() {
  const cart = useCart();
  const auth = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: collections } = useQuery({ queryKey: ["collections"], queryFn: fetchCollections });

  const navLink = "text-sm transition-colors hover:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container-duplika flex h-16 items-center gap-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
            <SheetTitle className="font-display text-2xl">Navigation</SheetTitle>
            <nav className="mt-6 space-y-6 text-base">
              <div className="space-y-2">
                <p className="eyebrow text-muted-foreground">Catégories</p>
                {(categories ?? []).map((c) => (
                  <Link
                    key={c.slug}
                    to="/boutique"
                    search={{ categorie: c.slug }}
                    onClick={() => setMenuOpen(false)}
                    className="block py-1"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <div className="space-y-2">
                <p className="eyebrow text-muted-foreground">Collections</p>
                {(collections ?? []).map((c) => (
                  <Link
                    key={c.slug}
                    to="/boutique"
                    search={{ collection: c.slug }}
                    onClick={() => setMenuOpen(false)}
                    className="block py-1"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <div className="space-y-2">
                <p className="eyebrow text-muted-foreground">La maison</p>
                <Link to="/pages/$slug" params={{ slug: "notre-histoire" }} onClick={() => setMenuOpen(false)} className="block py-1">
                  Notre histoire
                </Link>
                <Link to="/pages/$slug" params={{ slug: "livraison-retours" }} onClick={() => setMenuOpen(false)} className="block py-1">
                  Livraison & retours
                </Link>
                <Link to="/pages/$slug" params={{ slug: "faq" }} onClick={() => setMenuOpen(false)} className="block py-1">
                  FAQ
                </Link>
                <Link to="/suivi" onClick={() => setMenuOpen(false)} className="block py-1">
                  Suivre ma commande
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="font-display text-2xl tracking-[0.28em] lg:text-[1.6rem]">
          DUPLIKA
        </Link>

        <nav aria-label="Navigation principale" className="ml-8 hidden items-center gap-6 lg:flex">
          <Link to="/boutique" className={navLink}>
            Boutique
          </Link>
          
          {(categories ?? []).slice(0, 3).map((c) => (
            <Link key={c.slug} to="/boutique" search={{ categorie: c.slug }} className={navLink}>
              {c.name}
            </Link>
          ))}
          <Link to="/pages/$slug" params={{ slug: "notre-histoire" }} className={navLink}>
            Notre histoire
          </Link>
          <Link to="/smartmatch" className="text-sm font-medium transition-colors hover:text-primary">
             SmartMatch
             </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Rechercher"
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </Button>
          <Link
            to={auth.isAuthenticated ? "/compte" : "/connexion"}
            aria-label={auth.isAuthenticated ? "Accéder à mon compte" : "Se connecter"}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2 transition-colors hover:bg-secondary"
          >
            <User className="size-5" />
            {auth.isAuthenticated ? (
              <span className="hidden text-sm lg:inline">{auth.user?.firstName}</span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={cart.open}
            aria-label={`Ouvrir le panier, ${cart.count} article${cart.count > 1 ? "s" : ""}`}
            className="relative inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="size-5" />
            {cart.count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {cart.count}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height,opacity] duration-300",
          searchOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {searchOpen ? (
          <div className="container-duplika py-5">
            <SearchPanel onNavigate={() => setSearchOpen(false)} />
          </div>
        ) : null}
      </div>
    </header>
  );
}

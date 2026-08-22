import { cn } from "@/lib/utils";

type Tone = "new" | "promo" | "out" | "low";

const tones: Record<Tone, string> = {
  new: "bg-ink text-background",
  promo: "bg-primary text-primary-foreground",
  out: "bg-muted text-muted-foreground",
  low: "bg-background text-primary border border-primary/40",
};

const labels: Record<Tone, string> = {
  new: "Nouveau",
  promo: "Promotion",
  out: "Épuisé",
  low: "Stock faible",
};

export function StockBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center rounded-full px-2.5 py-1 leading-none",
        tones[tone],
        className,
      )}
    >
      {children ?? labels[tone]}
    </span>
  );
}

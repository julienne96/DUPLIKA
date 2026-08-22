import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";

const productImages: Record<string, string> = {
  "perruque-lace-noir-lisse-eclat": p1,
  "perruque-bouclee-ambre": p2,
  "perruque-blonde-solstice": p3,
  "tissage-naturel-onde-douce": p1,
};

export function getProductImage(
  slug: string,
  apiImage?: string | null,
): string {
  return apiImage || productImages[slug] || p1;
}
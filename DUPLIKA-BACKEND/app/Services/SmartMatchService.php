<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;

class SmartMatchService
{
    public function recommend(array $criteria): Collection
    {
        $products = Product::query()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->get();

        return $products
            ->map(function (Product $product) use ($criteria) {

                // Le produit doit respecter le budget maximum.
                if (
                    isset($criteria['budget']) &&
                    (float) $product->price > (float) $criteria['budget']
                ) {
                    return null;
                }

                // Si une couleur est choisie,
                // elle doit correspondre au produit.
                if (
                    ! empty($criteria['color']) &&
                    ! $this->matches(
                        $product->color,
                        $criteria['color']
                    )
                ) {
                    return null;
                }

                $score = 0;
                $maximumScore = 0;

                /*
                 * Type de perruque
                 */
                if (! empty($criteria['wig_type'])) {
                    $maximumScore += 25;

                    if (
                        $this->matchesWigType(
                            $product->wig_type,
                            $criteria['wig_type']
                        )
                    ) {
                        $score += 25;
                    }
                }

                /*
                 * Texture
                 */
                if (! empty($criteria['texture'])) {
                    $maximumScore += 20;

                    if (
                        $this->matches(
                            $product->texture,
                            $criteria['texture']
                        )
                    ) {
                        $score += 20;
                    }
                }

                /*
                 * Couleur
                 */
                if (! empty($criteria['color'])) {
                    $maximumScore += 15;

                    if (
                        $this->matches(
                            $product->color,
                            $criteria['color']
                        )
                    ) {
                        $score += 15;
                    }
                }

                /*
                 * Longueur
                 */
                if (! empty($criteria['length'])) {
                    $maximumScore += 15;

                    if (
                        $this->matches(
                            $product->length,
                            $criteria['length']
                        )
                    ) {
                        $score += 15;
                    }
                }

                /*
                 * Style
                 */
                if (! empty($criteria['style'])) {
                    $maximumScore += 15;

                    if (
                        $this->matches(
                            $product->style,
                            $criteria['style']
                        )
                    ) {
                        $score += 15;
                    }
                }

                /*
                 * Occasion
                 */
                if (! empty($criteria['occasion'])) {
                    $maximumScore += 10;

                    if (
                        $this->matches(
                            $product->occasion,
                            $criteria['occasion']
                        )
                    ) {
                        $score += 10;
                    }
                }

                /*
                 * Transformation du score en pourcentage.
                 */
                $product->smartmatch_score =
                    $maximumScore > 0
                        ? (int) round(
                            ($score / $maximumScore) * 100
                        )
                        : 0;

                return $product;
            })
            ->filter(function ($product) {
                return $product !== null
                    && $product->wig_type !== null
                    && $product->smartmatch_score > 0;
            })
            ->sortByDesc('smartmatch_score')
            ->take(3)
            ->values();
    }

    /**
     * Comparaison classique.
     */
    private function matches(
        ?string $productValue,
        ?string $wantedValue
    ): bool {
        if (! $wantedValue || ! $productValue) {
            return false;
        }

        return $this->normalize($productValue)
            === $this->normalize($wantedValue);
    }

    /**
     * Comparaison spéciale pour les types de perruques.
     *
     * Le frontend peut envoyer "lace" alors que
     * le catalogue contient "full_lace" ou "lace_front".
     */
    private function matchesWigType(
        ?string $productValue,
        ?string $wantedValue
    ): bool {
        if (! $productValue || ! $wantedValue) {
            return false;
        }

        $product = $this->normalize($productValue);
        $wanted = $this->normalize($wantedValue);

        if ($product === $wanted) {
            return true;
        }

        if ($wanted === 'lace') {
            return in_array(
                $product,
                [
                    'lace',
                    'full_lace',
                    'lace_front',
                    'lace_frontale',
                ],
                true
            );
        }

        return false;
    }

    /**
     * Normalise une valeur avant comparaison.
     */
    private function normalize(string $value): string
    {
        return mb_strtolower(trim($value));
    }
}
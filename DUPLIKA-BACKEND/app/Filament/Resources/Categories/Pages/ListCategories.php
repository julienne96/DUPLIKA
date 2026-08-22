<?php

namespace App\Filament\Resources\Categories\Pages;

use App\Filament\Resources\Categories\CategoryResource;
use App\Models\Category;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\Collection;

class ListCategories extends ListRecords
{
    protected static string $resource = CategoryResource::class;

    /**
     * Vue personnalisée sous forme de cartes.
     */
    protected string $view =
        'filament.resources.categories.pages.list-categories';

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label(__('admin.new_category'))
                ->icon('heroicon-o-plus'),
        ];
    }

    /**
     * Catégories avec le nombre de produits associés.
     */
    public function getCategoriesProperty(): Collection
    {
        return Category::query()
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }
}
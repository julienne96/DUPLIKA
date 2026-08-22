<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LowStockProducts extends BaseWidget
{
    protected int | string | array $columnSpan = 'full';

    public function getHeading(): string
    {
        return __('admin.low_stock_products');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Product::query()
                    ->where('is_active', true)
                    ->whereColumn('stock', '<=', 'low_stock_threshold')
                    ->orderBy('stock')
            )
            ->columns([
                TextColumn::make('name')
                    ->label(__('admin.product'))
                    ->searchable(),

                TextColumn::make('sku')
                    ->label('SKU')
                    ->searchable(),

                TextColumn::make('stock')
                    ->label(__('admin.current_stock'))
                    ->badge()
                    ->color(
                        fn ($state): string =>
                            (int) $state === 0
                                ? 'danger'
                                : 'warning'
                    )
                    ->sortable(),

                TextColumn::make('low_stock_threshold')
                    ->label(__('admin.alert_threshold'))
                    ->numeric(),

                TextColumn::make('stock_status')
                    ->label(__('admin.state'))
                    ->state(
                        fn (Product $record): string =>
                            $record->stock === 0
                                ? __('admin.out_of_stock')
                                : __('admin.low_stock')
                    )
                    ->badge()
                    ->color(
                        fn (Product $record): string =>
                            $record->stock === 0
                                ? 'danger'
                                : 'warning'
                    ),
            ])
            ->paginated(false);
    }
}
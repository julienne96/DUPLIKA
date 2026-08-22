<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentOrders extends BaseWidget
{
    protected int | string | array $columnSpan = 'full';

    public function getHeading(): string
    {
        return __('admin.recent_orders');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Order::query()
                    ->latest()
                    ->limit(5)
            )
            ->columns([
                TextColumn::make('reference')
                    ->label(__('admin.reference'))
                    ->searchable(),

                TextColumn::make('first_name')
                    ->label(__('admin.client'))
                    ->formatStateUsing(
                        fn ($record) =>
                            $record->first_name . ' ' . $record->last_name
                    ),

                TextColumn::make('total')
                    ->label(__('admin.amount'))
                    ->money(
                        'XOF',
                        decimalPlaces: 0
                    ),

                TextColumn::make('status')
                    ->label(__('admin.status'))
                    ->badge()
                    ->formatStateUsing(
                        fn (string $state): string => match ($state) {
                            'en_attente_paiement' => __('admin.order_received'),
                            'payee' => __('admin.confirmed'),
                            'en_preparation' => __('admin.preparing'),
                            'expediee' => __('admin.shipped'),
                            'livree' => __('admin.completed'),
                            'annulee' => __('admin.cancelled'),
                            'remboursee' => __('admin.refunded'),
                            default => $state,
                        }
                    )
                    ->color(
                        fn (string $state): string => match ($state) {
                            'en_attente_paiement' => 'warning',
                            'payee' => 'info',
                            'en_preparation' => 'primary',
                            'expediee' => 'primary',
                            'livree' => 'success',
                            'annulee' => 'danger',
                            'remboursee' => 'gray',
                            default => 'gray',
                        }
                    ),

                TextColumn::make('created_at')
                    ->label(__('admin.date'))
                    ->dateTime('d/m/Y H:i'),
            ])
            ->paginated(false);
    }
}
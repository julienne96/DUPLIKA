<?php

namespace App\Filament\Resources\Orders\Tables;

use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('reference')
                    ->label('Référence')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                TextColumn::make('user.name')
                    ->label('Client')
                    ->default('Client')
                    ->searchable(),

                TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'en_attente_paiement' => 'Commande reçue',
                        'payee' => 'Confirmée',
                        'en_preparation' => 'En préparation',
                        'expediee' => 'Prête / Expédiée',
                        'livree' => 'Terminée',
                        'annulee' => 'Annulée',
                        'remboursee' => 'Remboursée',
                        default => $state,
                    })
                    ->sortable(),

                TextColumn::make('payment_method')
                    ->label('Paiement')
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'tmoney' => 'T-Money',
                        'flooz' => 'Flooz',
                        default => 'Non renseigné',
                    }),

                TextColumn::make('shipping_method_name')
                    ->label('Réception')
                    ->default('Non renseigné'),

                TextColumn::make('total')
                    ->label('Total')
                    ->numeric()
                    ->suffix(' FCFA')
                    ->sortable(),

                TextColumn::make('paid_at')
                    ->label('Payée le')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Non payée')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])

            ->filters([
                SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'en_attente_paiement' => 'Commande reçue',
                        'payee' => 'Confirmée',
                        'en_preparation' => 'En préparation',
                        'expediee' => 'Prête / Expédiée',
                        'livree' => 'Terminée',
                        'annulee' => 'Annulée',
                        'remboursee' => 'Remboursée',
                    ]),

                SelectFilter::make('payment_method')
                    ->label('Moyen de paiement')
                    ->options([
                        'tmoney' => 'T-Money',
                        'flooz' => 'Flooz',
                    ]),
            ])

            ->defaultSort('created_at', 'desc')

            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ]);
    }
}
<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([

                Section::make('Commande')
                    ->schema([
                        TextEntry::make('reference')
                            ->label('Référence'),

                        TextEntry::make('status')
                            ->label('Statut')
                            ->badge()
                            ->formatStateUsing(
                                fn (string $state): string => match ($state) {
                                    'en_attente_paiement' => 'Commande reçue',
                                    'payee' => 'Confirmée',
                                    'en_preparation' => 'En préparation',
                                    'expediee' => 'Prête / Expédiée',
                                    'livree' => 'Terminée',
                                    'annulee' => 'Annulée',
                                    'remboursee' => 'Remboursée',
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

                        TextEntry::make('created_at')
                            ->label('Date de commande')
                            ->dateTime('d/m/Y H:i'),
                    ])
                    ->columns(3),

                Section::make('Client')
                    ->schema([
                        TextEntry::make('first_name')
                            ->label('Prénom'),

                        TextEntry::make('last_name')
                            ->label('Nom'),

                        TextEntry::make('email')
                            ->label('E-mail'),

                        TextEntry::make('phone')
                            ->label('Téléphone')
                            ->placeholder('-'),
                    ])
                    ->columns(2),

                Section::make('Réception')
                    ->schema([
                        TextEntry::make('shipping_method_name')
                            ->label('Mode de réception')
                            ->badge(),

                        TextEntry::make('city')
                            ->label('Ville'),

                        TextEntry::make('address_line1')
                            ->label('Adresse / Retrait'),

                        TextEntry::make('delivery_notes')
                            ->label('Notes')
                            ->placeholder('-'),
                    ])
                    ->columns(2),

                Section::make('Articles commandés')
                    ->schema([
                        RepeatableEntry::make('items')
                            ->label('')
                            ->schema([
                                TextEntry::make('name')
                                    ->label('Produit'),

                                TextEntry::make('quantity')
                                    ->label('Quantité'),

                                TextEntry::make('unit_price')
                                    ->label('Prix unitaire')
                                    ->money(
                                        'XOF',
                                        decimalPlaces: 0
                                    ),

                                TextEntry::make('line_total')
                                    ->label('Total')
                                    ->money(
                                        'XOF',
                                        decimalPlaces: 0
                                    ),
                            ])
                            ->columns(4)
                            ->columnSpanFull(),
                    ]),

                Section::make('Montants')
                    ->schema([
                        TextEntry::make('subtotal')
                            ->label('Sous-total')
                            ->money(
                                'XOF',
                                decimalPlaces: 0
                            ),

                        TextEntry::make('shipping')
                            ->label('Livraison')
                            ->money(
                                'XOF',
                                decimalPlaces: 0
                            ),

                        TextEntry::make('total')
                            ->label('Total produits')
                            ->money(
                                'XOF',
                                decimalPlaces: 0
                            ),
                    ])
                    ->columns(3),
            ]);
    }
}
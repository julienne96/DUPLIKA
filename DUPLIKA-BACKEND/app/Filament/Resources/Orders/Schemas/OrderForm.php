<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([

                Section::make('Commande')
                    ->schema([
                        TextInput::make('reference')
                            ->label('Référence')
                            ->disabled()
                            ->dehydrated(),

                        Select::make('status')
                            ->label('Statut de la commande')
                            ->options([
                                'en_attente_paiement' => 'Commande reçue',
                                'payee' => 'Confirmée',
                                'en_preparation' => 'En préparation',
                                'expediee' => 'Prête / Expédiée',
                                'livree' => 'Terminée',
                                'annulee' => 'Annulée',
                                'remboursee' => 'Remboursée',
                            ])
                            ->required()
                            ->native(false),
                    ])
                    ->columns(2),

                Section::make('Client')
                    ->schema([
                        TextInput::make('first_name')
                            ->label('Prénom')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('last_name')
                            ->label('Nom')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('email')
                            ->label('E-mail')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('phone')
                            ->label('Téléphone')
                            ->disabled()
                            ->dehydrated(),
                    ])
                    ->columns(2),

                Section::make('Mode de réception')
                    ->schema([
                        TextInput::make('shipping_method_name')
                            ->label('Mode de réception')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('city')
                            ->label('Ville')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('address_line1')
                            ->label('Adresse / Retrait')
                            ->disabled()
                            ->dehydrated()
                            ->columnSpanFull(),

                        Textarea::make('delivery_notes')
                            ->label('Notes du client')
                            ->disabled()
                            ->dehydrated()
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Montants')
                    ->schema([
                        TextInput::make('subtotal')
                            ->label('Sous-total')
                            ->numeric()
                            ->suffix(' FCFA')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('shipping')
                            ->label('Livraison')
                            ->numeric()
                            ->suffix(' FCFA')
                            ->disabled()
                            ->dehydrated(),

                        TextInput::make('total')
                            ->label('Total produits')
                            ->numeric()
                            ->suffix(' FCFA')
                            ->disabled()
                            ->dehydrated(),
                    ])
                    ->columns(3),
            ]);
    }
}
<?php

namespace App\Filament\Resources\ContactMessages\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ContactMessageInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Expéditeur')
                    ->schema([
                        TextEntry::make('name')
                            ->label('Nom'),

                        TextEntry::make('email')
                            ->label('E-mail'),

                        TextEntry::make('phone')
                            ->label('Téléphone')
                            ->placeholder('Non renseigné'),

                        TextEntry::make('created_at')
                            ->label('Reçu le')
                            ->dateTime('d/m/Y à H:i'),
                    ])
                    ->columns(2),

                Section::make('Message')
                    ->schema([
                        TextEntry::make('subject')
                            ->label('Sujet')
                            ->placeholder('Sans sujet')
                            ->columnSpanFull(),

                        TextEntry::make('message')
                            ->label('Contenu')
                            ->columnSpanFull(),
                    ]),

                Section::make('Traitement')
                    ->schema([
                        TextEntry::make('status')
                            ->label('Statut')
                            ->badge()
                            ->formatStateUsing(
                                fn (string $state): string => match ($state) {
                                    'nouveau' => 'À traiter',
                                    'lu' => 'Lu',
                                    'traite' => 'Traité',
                                    default => $state,
                                }
                            )
                            ->color(
                                fn (string $state): string => match ($state) {
                                    'nouveau' => 'danger',
                                    'lu' => 'warning',
                                    'traite' => 'success',
                                    default => 'gray',
                                }
                            ),

                        TextEntry::make('read_at')
                            ->label('Lu le')
                            ->dateTime('d/m/Y à H:i')
                            ->placeholder('Pas encore lu'),

                        TextEntry::make('processed_at')
                            ->label('Traité le')
                            ->dateTime('d/m/Y à H:i')
                            ->placeholder('Pas encore traité'),
                    ])
                    ->columns(3),
            ]);
    }
}
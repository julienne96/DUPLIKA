<?php

namespace App\Filament\Resources\NewsletterSubscribers\Tables;

use App\Models\NewsletterSubscriber;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class NewsletterSubscribersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('email')
                    ->label('Adresse e-mail')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(
                        fn (string $state): string => match ($state) {
                            'active' => 'Abonné actif',
                            'unsubscribed' => 'Désinscrit',
                            default => $state,
                        }
                    )
                    ->color(
                        fn (string $state): string => match ($state) {
                            'active' => 'success',
                            'unsubscribed' => 'gray',
                            default => 'gray',
                        }
                    )
                    ->sortable(),

                TextColumn::make('subscribed_at')
                    ->label("Date d'inscription")
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('—')
                    ->sortable(),

                TextColumn::make('unsubscribed_at')
                    ->label('Désinscrit le')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('—')
                    ->sortable(),
            ])

            ->filters([
                SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'active' => 'Abonnés actifs',
                        'unsubscribed' => 'Désinscrits',
                    ]),
            ])

            ->defaultSort('subscribed_at', 'desc')

            ->recordActions([
                ViewAction::make()
                    ->label('Voir')
                    ->icon('heroicon-o-eye'),

                Action::make('unsubscribe')
                    ->label('Désinscrire')
                    ->icon('heroicon-o-user-minus')
                    ->color('danger')
                    ->visible(
                        fn (NewsletterSubscriber $record): bool =>
                            $record->status === 'active'
                    )
                    ->requiresConfirmation()
                    ->modalHeading('Désinscrire ce contact ?')
                    ->modalDescription(
                        'Cette adresse ne sera plus considérée comme abonnée à la newsletter.'
                    )
                    ->action(
                        function (NewsletterSubscriber $record): void {
                            $record->update([
                                'status' => 'unsubscribed',
                                'unsubscribed_at' => now(),
                            ]);
                        }
                    ),

                Action::make('reactivate')
                    ->label('Réactiver')
                    ->icon('heroicon-o-arrow-path')
                    ->color('success')
                    ->visible(
                        fn (NewsletterSubscriber $record): bool =>
                            $record->status === 'unsubscribed'
                    )
                    ->requiresConfirmation()
                    ->modalHeading('Réactiver cet abonné ?')
                    ->action(
                        function (NewsletterSubscriber $record): void {
                            $record->update([
                                'status' => 'active',
                                'subscribed_at' => now(),
                                'unsubscribed_at' => null,
                            ]);
                        }
                    ),
            ])

            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->label('Supprimer'),
                ]),
            ]);
    }
}
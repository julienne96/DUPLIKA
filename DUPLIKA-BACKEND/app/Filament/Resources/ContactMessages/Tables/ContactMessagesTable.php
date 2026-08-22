<?php

namespace App\Filament\Resources\ContactMessages\Tables;

use App\Models\ContactMessage;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ContactMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Expéditeur')
                    ->searchable()
                    ->sortable()
                    ->description(
                        fn (ContactMessage $record): string =>
                            $record->email
                    ),

                TextColumn::make('phone')
                    ->label('Téléphone')
                    ->placeholder('—')
                    ->searchable(),

                TextColumn::make('subject')
                    ->label('Sujet')
                    ->placeholder('Sans sujet')
                    ->searchable()
                    ->limit(35),

                TextColumn::make('message')
                    ->label('Message')
                    ->limit(50)
                    ->wrap()
                    ->toggleable(),

                TextColumn::make('status')
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
                    )
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Reçu le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])

            ->filters([
                SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'nouveau' => 'À traiter',
                        'lu' => 'Lu',
                        'traite' => 'Traité',
                    ]),
            ])

            ->defaultSort(
                'created_at',
                'desc'
            )

            ->recordActions([
                ViewAction::make()
                    ->label('Voir')
                    ->icon('heroicon-o-eye'),

                Action::make('markRead')
                    ->label('Marquer comme lu')
                    ->icon('heroicon-o-envelope-open')
                    ->color('warning')
                    ->visible(
                        fn (ContactMessage $record): bool =>
                            $record->status === 'nouveau'
                    )
                    ->action(function (ContactMessage $record): void {
                        $record->update([
                            'status' => 'lu',
                            'read_at' => now(),
                        ]);
                    }),

                Action::make('markProcessed')
                    ->label('Marquer comme traité')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(
                        fn (ContactMessage $record): bool =>
                            $record->status !== 'traite'
                    )
                    ->requiresConfirmation()
                    ->modalHeading('Marquer ce message comme traité ?')
                    ->modalDescription(
                        'Le message restera accessible dans l’historique.'
                    )
                    ->action(function (ContactMessage $record): void {
                        $record->update([
                            'status' => 'traite',
                            'read_at' => $record->read_at ?? now(),
                            'processed_at' => now(),
                        ]);
                    }),
            ])

            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->label('Supprimer'),
                ]),
            ]);
    }
}
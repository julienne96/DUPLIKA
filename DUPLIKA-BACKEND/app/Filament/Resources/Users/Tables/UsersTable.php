<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('email')
                    ->label('E-mail')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('roles.name')
                    ->label('Rôle')
                    ->badge()
                    ->separator(',')
                    ->color(
                        fn (string $state): string => match ($state) {
                            'Administrateur' => 'danger',
                            'Gestionnaire' => 'warning',
                            'Client' => 'success',
                            default => 'gray',
                        }
                    ),

                TextColumn::make('is_active')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(
                        fn (bool $state): string =>
                            $state ? 'Actif' : 'Inactif'
                    )
                    ->color(
                        fn (bool $state): string =>
                            $state ? 'success' : 'danger'
                    )
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label("Date d'inscription")
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])

            ->filters([
                SelectFilter::make('role')
                    ->label('Rôle')
                    ->relationship(
                        'roles',
                        'name'
                    ),

                SelectFilter::make('is_active')
                    ->label('Statut')
                    ->options([
                        1 => 'Actif',
                        0 => 'Inactif',
                    ]),
            ])

            ->defaultSort(
                'created_at',
                'desc'
            )

            ->recordActions([
                ViewAction::make()
                    ->label('Voir'),

                EditAction::make()
                    ->label('Modifier'),

                Action::make('deactivate')
                    ->label('Désactiver')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Désactiver ce compte ?')
                    ->modalDescription(
                        'Le client ne pourra plus se connecter à DUPLIKA.'
                    )
                    ->visible(
                        fn ($record): bool =>
                            $record->hasRole('Client')
                            && $record->is_active
                    )
                    ->action(function ($record): void {
                        $record->update([
                            'is_active' => false,
                        ]);

                        $record->tokens()->delete();
                    }),

                Action::make('activate')
                    ->label('Activer')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Réactiver ce compte ?')
                    ->modalDescription(
                        'Le client pourra de nouveau se connecter à DUPLIKA.'
                    )
                    ->visible(
                        fn ($record): bool =>
                            $record->hasRole('Client')
                            && ! $record->is_active
                    )
                    ->action(function ($record): void {
                        $record->update([
                            'is_active' => true,
                        ]);
                    }),
            ]);
    }
}
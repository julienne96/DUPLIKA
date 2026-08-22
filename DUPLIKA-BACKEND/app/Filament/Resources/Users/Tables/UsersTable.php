<?php

namespace App\Filament\Resources\Users\Tables;

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
            ]);
    }
}
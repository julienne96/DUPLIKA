<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Hash;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informations utilisateur')
                    ->schema([
                        TextInput::make('name')
                            ->label('Nom')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('email')
                            ->label('E-mail')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),

                        Select::make('roles')
                            ->label('Rôle')
                            ->relationship(
                                name: 'roles',
                                titleAttribute: 'name'
                            )
                            ->multiple(false)
                            ->preload()
                            ->searchable()
                            ->required(),
                    ])
                    ->columns(2),

                Section::make('Sécurité')
                    ->schema([
                        TextInput::make('password')
                            ->label('Mot de passe')
                            ->password()
                            ->revealable()
                            ->dehydrated(
                                fn ($state) => filled($state)
                            )
                            ->required(
                                fn (string $operation): bool =>
                                    $operation === 'create'
                            )
                            ->minLength(8)
                            ->helperText(
                                "Laissez vide lors d'une modification pour conserver le mot de passe actuel."
                            ),
                    ]),
            ]);
    }
}
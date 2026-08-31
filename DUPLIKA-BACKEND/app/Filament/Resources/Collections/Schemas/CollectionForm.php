<?php

namespace App\Filament\Resources\Collections\Schemas;

use App\Services\CloudinaryService;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class CollectionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informations de la collection')
                    ->schema([
                        TextInput::make('name')
                            ->label('Nom')
                            ->required()
                            ->maxLength(150)
                            ->live(onBlur: true)
                            ->afterStateUpdated(
                                fn ($state, callable $set) =>
                                    $set('slug', Str::slug($state))
                            ),

                        TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(180),

                        TextInput::make('tagline')
                            ->label('Slogan')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        FileUpload::make('image')
                            ->label('Image')
                            ->image()
                            ->imageEditor()
                            ->maxSize(5120)
                            ->acceptedFileTypes([
                                'image/jpeg',
                                'image/png',
                                'image/webp',
                            ])
                            ->saveUploadedFileUsing(
                                function (TemporaryUploadedFile $file): string {
                                    $cloudinary = app(CloudinaryService::class);

                                    $result = $cloudinary->uploadImage(
                                        $file->getRealPath(),
                                        'duplika/collections'
                                    );

                                    return $result['url'];
                                }
                            ),

                        TextInput::make('sort_order')
                            ->label("Ordre d'affichage")
                            ->numeric()
                            ->default(0)
                            ->minValue(0),

                        Toggle::make('is_active')
                            ->label('Collection active')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }
}
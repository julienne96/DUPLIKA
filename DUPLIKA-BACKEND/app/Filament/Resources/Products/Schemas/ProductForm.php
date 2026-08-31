<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Services\CloudinaryService;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([

                Section::make('Informations générales')
                    ->schema([

                        Select::make('category_id')
                            ->label('Catégorie')
                            ->relationship('category', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        TextInput::make('name')
                            ->label('Nom du produit')
                            ->required()
                            ->maxLength(180)
                            ->live(onBlur: true)
                            ->afterStateUpdated(
                                fn ($state, callable $set) =>
                                    $set('slug', Str::slug($state))
                            ),

                        TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(200),

                        TextInput::make('sku')
                            ->label('SKU')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(100),

                        TextInput::make('short_description')
                            ->label('Description courte')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Textarea::make('description')
                            ->label('Description complète')
                            ->rows(5)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Prix et stock')
                    ->schema([

                        TextInput::make('price')
                            ->label('Prix')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->suffix('FCFA'),

                        TextInput::make('compare_at_price')
                            ->label('Ancien prix')
                            ->numeric()
                            ->minValue(0)
                            ->suffix('FCFA'),

                        TextInput::make('stock')
                            ->label('Stock disponible')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->default(0),

                        TextInput::make('low_stock_threshold')
                            ->label("Seuil d'alerte stock")
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->default(3),
                    ])
                    ->columns(2),

                Section::make('Image du produit')
                    ->schema([

                        FileUpload::make('image')
                            ->label('Image principale')
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
                                        'duplika/products'
                                    );

                                    return $result['url'];
                                }
                            ),
                    ]),

                Section::make('Critères SmartMatch')
                    ->description(
                        'Ces informations seront utilisées pour recommander les produits aux clientes.'
                    )
                    ->schema([

                        Select::make('wig_type')
                            ->label('Type de perruque')
                            ->options([
                                'lace_front' => 'Lace Front',
                                'closure' => 'Closure',
                                'full_lace' => 'Full Lace',
                                'headband' => 'Headband',
                                'u_part' => 'U-Part',
                                'autre' => 'Autre',
                            ])
                            ->searchable(),

                        Select::make('texture')
                            ->label('Texture')
                            ->options([
                                'lisse' => 'Lisse',
                                'ondulee' => 'Ondulée',
                                'bouclee' => 'Bouclée',
                                'kinky' => 'Kinky',
                                'afro' => 'Afro',
                                'autre' => 'Autre',
                            ])
                            ->searchable(),

                        TextInput::make('color')
                            ->label('Couleur')
                            ->maxLength(100),

                        TextInput::make('length')
                            ->label('Longueur')
                            ->maxLength(100),

                        TextInput::make('style')
                            ->label('Style')
                            ->maxLength(150),

                        Select::make('occasion')
                            ->label('Occasion')
                            ->options([
                                'quotidien' => 'Quotidien',
                                'travail' => 'Travail',
                                'ceremonie' => 'Cérémonie',
                                'mariage' => 'Mariage',
                                'soiree' => 'Soirée',
                                'vacances' => 'Vacances',
                                'autre' => 'Autre',
                            ])
                            ->searchable(),
                    ])
                    ->columns(2),

                Section::make('Publication')
                    ->schema([

                        Toggle::make('is_new')
                            ->label('Nouveau produit')
                            ->default(false),

                        Toggle::make('is_active')
                            ->label('Produit actif')
                            ->default(true),

                        DateTimePicker::make('published_at')
                            ->label('Date de publication'),

                        TextInput::make('rating_average')
                            ->label('Note moyenne')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(5)
                            ->default(0),

                        TextInput::make('rating_count')
                            ->label("Nombre d'avis")
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->default(0),
                    ])
                    ->columns(2),
            ]);
    }
}
<?php

namespace App\Filament\Resources\NewsletterSubscribers;

use App\Filament\Resources\NewsletterSubscribers\Pages\ListNewsletterSubscribers;
use App\Filament\Resources\NewsletterSubscribers\Pages\ViewNewsletterSubscriber;
use App\Filament\Resources\NewsletterSubscribers\Schemas\NewsletterSubscriberInfolist;
use App\Filament\Resources\NewsletterSubscribers\Tables\NewsletterSubscribersTable;
use App\Filament\Resources\NewsletterSubscribers\Widgets\NewsletterStats;
use App\Models\NewsletterSubscriber;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class NewsletterSubscriberResource extends Resource
{
    protected static ?string $model = NewsletterSubscriber::class;

    protected static string|BackedEnum|null $navigationIcon =
        Heroicon::OutlinedEnvelope;
public static function getNavigationLabel(): string
{
    return __('admin.newsletter');
}

public static function getModelLabel(): string
{
    return app()->getLocale() === 'fr'
        ? 'abonné'
        : 'subscriber';
}

public static function getPluralModelLabel(): string
{
    return __('admin.newsletter');
}

    protected static ?string $recordTitleAttribute = 'email';

    protected static ?int $navigationSort = 40;

    public static function infolist(Schema $schema): Schema
    {
        return NewsletterSubscriberInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return NewsletterSubscribersTable::configure($table);
    }

    public static function canAccess(): bool
    {
        return auth()->check()
    && auth()->user()->hasRole('Administrateur');
    }

    public static function getNavigationBadge(): ?string
    {
        $count = NewsletterSubscriber::query()
            ->where('status', 'active')
            ->count();

        return $count > 0
            ? (string) $count
            : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'success';
    }

    public static function getWidgets(): array
    {
        return [
            NewsletterStats::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListNewsletterSubscribers::route('/'),
            'view' => ViewNewsletterSubscriber::route('/{record}'),
        ];
    }
}
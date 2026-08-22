<?php

namespace App\Filament\Resources\ContactMessages;

use App\Filament\Resources\ContactMessages\Pages\ListContactMessages;
use App\Filament\Resources\ContactMessages\Pages\ViewContactMessage;
use App\Filament\Resources\ContactMessages\Schemas\ContactMessageInfolist;
use App\Filament\Resources\ContactMessages\Tables\ContactMessagesTable;
use App\Models\ContactMessage;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ContactMessageResource extends Resource
{
    protected static ?string $model = ContactMessage::class;

    protected static string|BackedEnum|null $navigationIcon =
        Heroicon::OutlinedChatBubbleLeftRight;

    public static function getNavigationLabel(): string
{
    return __('admin.messages');
}

public static function getModelLabel(): string
{
    return app()->getLocale() === 'fr'
        ? 'message'
        : 'message';
}

public static function getPluralModelLabel(): string
{
    return __('admin.messages');
}
    protected static ?int $navigationSort = 30;

    public static function infolist(Schema $schema): Schema
    {
        return ContactMessageInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ContactMessagesTable::configure($table);
    }

    public static function canAccess(): bool
    {
       return auth()->check()
    && auth()->user()->hasRole('Administrateur');
    }

    /**
     * Nombre de nouveaux messages affiché directement
     * dans le menu du back-office.
     */
    public static function getNavigationBadge(): ?string
    {
        $count = ContactMessage::query()
            ->where('status', 'nouveau')
            ->count();

        return $count > 0
            ? (string) $count
            : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListContactMessages::route('/'),
            'view' => ViewContactMessage::route('/{record}'),
        ];
    }
}
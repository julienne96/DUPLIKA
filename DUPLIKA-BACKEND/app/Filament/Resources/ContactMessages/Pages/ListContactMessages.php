<?php

namespace App\Filament\Resources\ContactMessages\Pages;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Models\ContactMessage;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListContactMessages extends ListRecords
{
    protected static string $resource =
        ContactMessageResource::class;

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('Tous les messages')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->badge(
                    ContactMessage::query()->count()
                ),

            'pending' => Tab::make('À traiter')
                ->icon('heroicon-o-bell-alert')
                ->badge(
                    ContactMessage::query()
                        ->where('status', 'nouveau')
                        ->count()
                )
                ->badgeColor('danger')
                ->modifyQueryUsing(
                    fn (Builder $query): Builder =>
                        $query->where(
                            'status',
                            'nouveau'
                        )
                ),

            'read' => Tab::make('Lus')
                ->icon('heroicon-o-envelope-open')
                ->badge(
                    ContactMessage::query()
                        ->where('status', 'lu')
                        ->count()
                )
                ->badgeColor('warning')
                ->modifyQueryUsing(
                    fn (Builder $query): Builder =>
                        $query->where(
                            'status',
                            'lu'
                        )
                ),

            'processed' => Tab::make('Traités')
                ->icon('heroicon-o-check-circle')
                ->badge(
                    ContactMessage::query()
                        ->where('status', 'traite')
                        ->count()
                )
                ->badgeColor('success')
                ->modifyQueryUsing(
                    fn (Builder $query): Builder =>
                        $query->where(
                            'status',
                            'traite'
                        )
                ),
        ];
    }

    public function getDefaultActiveTab(): string | int | null
    {
        return 'all';
    }
}